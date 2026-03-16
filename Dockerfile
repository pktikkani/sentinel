# ─────────────────────────────────────────────────────────────
# Sentinel + pentest-audit — All-in-one Docker image
# Build context should be the PARENT directory containing both
# sentinel/ and pentest-audit/ directories.
#
#   With tools:    docker compose up --build -d
#   Without tools: docker compose build --build-arg INSTALL_TOOLS=false sentinel
#
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

# Copy sentinel source first
COPY sentinel/ .

# Remove the file: dep and install remaining dependencies
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); delete p.dependencies['pentest-audit']; require('fs').writeFileSync('package.json',JSON.stringify(p,null,2));"
RUN rm -rf node_modules
RUN npm install --ignore-scripts

# Copy the built pentest-audit into node_modules
COPY --from=build-cli /build/pentest-audit/dist ./node_modules/pentest-audit/dist
COPY --from=build-cli /build/pentest-audit/package.json ./node_modules/pentest-audit/package.json
COPY --from=build-cli /build/pentest-audit/node_modules ./node_modules/pentest-audit/node_modules

# Generate Prisma client
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build Next.js
RUN npm run build

# ─── Stage 3: Production image ───
FROM node:22-bookworm-slim AS production

ARG INSTALL_TOOLS=true

# Core system dependencies (always needed for git clone in scans)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget git ca-certificates unzip \
    && rm -rf /var/lib/apt/lists/*

# ─── Security tools (conditional) ───
RUN if [ "$INSTALL_TOOLS" = "true" ]; then \
      apt-get update && apt-get install -y --no-install-recommends \
        gnupg dnsutils python3 python3-pip python3-venv nmap libxml2-utils \
      && rm -rf /var/lib/apt/lists/*; \
    fi

# Go-based security tools
ENV GOPATH=/opt/go
ENV PATH="${GOPATH}/bin:/usr/local/go/bin:${PATH}"

RUN if [ "$INSTALL_TOOLS" = "true" ]; then \
      curl -fsSL https://go.dev/dl/go1.26.1.linux-amd64.tar.gz | tar -C /usr/local -xzf - \
      && go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest \
      && go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest \
      && go install github.com/projectdiscovery/httpx/cmd/httpx@latest \
      && go install github.com/ffuf/ffuf/v2@latest \
      && go install github.com/OJ/gobuster/v3@latest \
      && git clone --depth 1 https://github.com/gitleaks/gitleaks.git /tmp/gitleaks \
      && cd /tmp/gitleaks && go build -o /opt/go/bin/gitleaks . && cd / && rm -rf /tmp/gitleaks \
      && git clone --depth 1 https://github.com/trufflesecurity/trufflehog.git /tmp/trufflehog \
      && cd /tmp/trufflehog && go build -o /opt/go/bin/trufflehog . && cd / && rm -rf /tmp/trufflehog \
      && cp /opt/go/bin/* /usr/local/bin/ \
      && rm -rf /usr/local/go /opt/go /root/.cache/go-build; \
    fi

# Feroxbuster (prebuilt binary)
RUN if [ "$INSTALL_TOOLS" = "true" ]; then \
      FEROX_VERSION=$(curl -s https://api.github.com/repos/epi052/feroxbuster/releases/latest | grep tag_name | cut -d'"' -f4) \
      && curl -fsSL "https://github.com/epi052/feroxbuster/releases/download/${FEROX_VERSION}/x86_64-linux-feroxbuster.zip" \
         -o /tmp/ferox.zip \
      && unzip /tmp/ferox.zip -d /usr/local/bin/ \
      && chmod +x /usr/local/bin/feroxbuster \
      && rm /tmp/ferox.zip; \
    fi

# Python-based tools
RUN if [ "$INSTALL_TOOLS" = "true" ]; then \
      python3 -m venv /opt/pytools \
      && /opt/pytools/bin/pip install --no-cache-dir \
         wafw00f arjun sqlmap commix sslyze \
         git+https://github.com/devanshbatham/paramspider.git \
      && for bin in wafw00f arjun paramspider sqlmap commix sslyze; do \
           ln -sf /opt/pytools/bin/$bin /usr/local/bin/$bin; \
         done; \
    fi

# Other tools
RUN if [ "$INSTALL_TOOLS" = "true" ]; then \
      git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl \
      && ln -s /opt/testssl/testssl.sh /usr/local/bin/testssl.sh \
      && git clone --depth 1 https://github.com/urbanadventurer/WhatWeb.git /opt/whatweb \
      && ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb; \
    fi

# dalfox
RUN if [ "$INSTALL_TOOLS" = "true" ]; then \
      DALFOX_VERSION=$(curl -s https://api.github.com/repos/hahwul/dalfox/releases/latest | grep tag_name | cut -d'"' -f4) \
      && curl -fsSL "https://github.com/hahwul/dalfox/releases/download/${DALFOX_VERSION}/dalfox_${DALFOX_VERSION#v}_linux_amd64.tar.gz" \
         | tar -xzf - -C /usr/local/bin dalfox || true; \
    fi

# SecLists common wordlist
RUN if [ "$INSTALL_TOOLS" = "true" ]; then \
      mkdir -p /usr/share/seclists/Discovery/Web-Content \
      && curl -fsSL https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt \
         -o /usr/share/seclists/Discovery/Web-Content/common.txt; \
    fi

# ─── Application ───
WORKDIR /app

# Copy Sentinel app (pentest-audit is already inside node_modules/)
COPY --from=build-app /build/sentinel/.next /app/.next
COPY --from=build-app /build/sentinel/node_modules /app/node_modules
COPY --from=build-app /build/sentinel/package.json /app/package.json
COPY --from=build-app /build/sentinel/generated /app/generated
COPY --from=build-app /build/sentinel/prisma /app/prisma
COPY --from=build-app /build/sentinel/prisma.config.ts /app/prisma.config.ts
COPY --from=build-app /build/sentinel/next.config.ts /app/next.config.ts
COPY --from=build-app /build/sentinel/tsconfig.json /app/tsconfig.json

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-semi-space-size=2"
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["sh", "-c", "npx prisma db push && npm start"]
