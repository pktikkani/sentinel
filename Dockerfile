# ─────────────────────────────────────────────────────────────
# Sentinel + pentest-audit — All-in-one Docker image
# Build context should be the PARENT directory containing both
# sentinel/ and pentest-audit/ directories.
#
#   docker build -f sentinel/Dockerfile -t sentinel .
#
# Or use docker-compose.yml (recommended).
# ─────────────────────────────────────────────────────────────

# ─── Stage 1: Build pentest-audit ───
FROM node:22-bookworm-slim AS build-cli
WORKDIR /build/pentest-audit
COPY pentest-audit/package.json pentest-audit/package-lock.json* pentest-audit/tsup.config.ts pentest-audit/tsconfig.json ./
COPY pentest-audit/src ./src
COPY pentest-audit/bin ./bin
RUN npm ci && npx tsup

# ─── Stage 2: Build Sentinel ───
FROM node:22-bookworm-slim AS build-app
WORKDIR /build/sentinel

# Copy sentinel package files, remove the file: dep (we'll link it manually)
COPY sentinel/package.json sentinel/package-lock.json* ./
RUN sed -i '/"pentest-audit"/d' package.json
RUN npm install --ignore-scripts

# Copy the built pentest-audit into node_modules directly
COPY --from=build-cli /build/pentest-audit/dist ./node_modules/pentest-audit/dist
COPY --from=build-cli /build/pentest-audit/package.json ./node_modules/pentest-audit/package.json
COPY --from=build-cli /build/pentest-audit/node_modules ./node_modules/pentest-audit/node_modules

COPY sentinel/ .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# ─── Stage 3: Production image with security tools ───
FROM node:22-bookworm-slim AS production

# Core system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget git ca-certificates unzip gnupg dnsutils \
    python3 python3-pip python3-venv \
    nmap libxml2-utils \
    && rm -rf /var/lib/apt/lists/*

# ─── Go-based security tools ───
ENV GOPATH=/opt/go
ENV PATH="${GOPATH}/bin:/usr/local/go/bin:${PATH}"

RUN curl -fsSL https://go.dev/dl/go1.24.3.linux-amd64.tar.gz | tar -C /usr/local -xzf - \
    && go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest \
    && go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest \
    && go install github.com/projectdiscovery/httpx/cmd/httpx@latest \
    && go install github.com/ffuf/ffuf/v2@latest \
    && go install github.com/OJ/gobuster/v3@latest \
    && go install github.com/trufflesecurity/trufflehog/v3@latest \
    && go install github.com/gitleaks/gitleaks/v8/cmd/gitleaks@latest \
    # Keep only binaries, remove Go SDK + caches
    && cp /opt/go/bin/* /usr/local/bin/ \
    && rm -rf /usr/local/go /opt/go /root/.cache/go-build

# ─── Rust-based tools ───
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal \
    && . /root/.cargo/env \
    && cargo install feroxbuster \
    && cp /root/.cargo/bin/feroxbuster /usr/local/bin/ \
    && rustup self uninstall -y \
    && rm -rf /root/.cargo

# ─── Python-based tools ───
RUN python3 -m venv /opt/pytools \
    && /opt/pytools/bin/pip install --no-cache-dir \
       wafw00f arjun paramspider sqlmap commix sslyze \
    && for bin in wafw00f arjun paramspider sqlmap commix sslyze; do \
         ln -sf /opt/pytools/bin/$bin /usr/local/bin/$bin; \
       done

# ─── Other tools ───
# testssl.sh
RUN git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl \
    && ln -s /opt/testssl/testssl.sh /usr/local/bin/testssl.sh

# WhatWeb
RUN git clone --depth 1 https://github.com/urbanadventurer/WhatWeb.git /opt/whatweb \
    && ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb

# dalfox
RUN DALFOX_VERSION=$(curl -s https://api.github.com/repos/hahwul/dalfox/releases/latest | grep tag_name | cut -d'"' -f4) \
    && curl -fsSL "https://github.com/hahwul/dalfox/releases/download/${DALFOX_VERSION}/dalfox_${DALFOX_VERSION#v}_linux_amd64.tar.gz" \
       | tar -xzf - -C /usr/local/bin dalfox || true

# SecLists common wordlist
RUN mkdir -p /usr/share/seclists/Discovery/Web-Content \
    && curl -fsSL https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt \
       -o /usr/share/seclists/Discovery/Web-Content/common.txt

# ─── Application ───
WORKDIR /app

# Copy Sentinel app (pentest-audit is already inside node_modules/)
COPY --from=build-app /build/sentinel/.next /app/.next
COPY --from=build-app /build/sentinel/public /app/public
COPY --from=build-app /build/sentinel/node_modules /app/node_modules
COPY --from=build-app /build/sentinel/package.json /app/package.json
COPY --from=build-app /build/sentinel/generated /app/generated
COPY --from=build-app /build/sentinel/prisma /app/prisma
COPY --from=build-app /build/sentinel/next.config.ts /app/next.config.ts
COPY --from=build-app /build/sentinel/tsconfig.json /app/tsconfig.json

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]
