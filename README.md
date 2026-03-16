# Sentinel

AI-powered security intelligence for your code. Sentinel is a web dashboard that wraps the [pentest-audit](https://github.com/pavanjoshi/pentest-audit) CLI, giving you a visual interface to scan GitHub repositories for vulnerabilities, misconfigurations, and compliance gaps.

## Features

- **GitHub Integration** — Connect your GitHub account, browse repos, pick branches, and scan
- **AI-Powered Analysis** — Claude-driven code analysis that understands context, not just patterns
- **25+ Security Tools** — Built-in URL scanner plus external tools like Nuclei, Nmap, SQLMap, and more
- **Multi-Pass Scanning** — Two-pass analysis where the second pass deep-dives into the riskiest findings
- **Software Composition Analysis** — Detect vulnerable dependencies across npm, pip, Go, Cargo, Maven, Composer, and more
- **License Compliance** — Check dependency licenses against commercial, open-source, or permissive-only policies
- **Compliance Mapping** — Map findings to SOC 2, PCI DSS, HIPAA, NIST 800-53, GDPR, DPDPA, and ISO 27001
- **Built-in URL Scanner** — Zero-dependency scanner for security headers, TLS, CORS, cookies, DNS, sensitive paths, and open redirects
- **Dark/Light Mode** — Automatically matches your system theme via Tailwind v4

## Quick Start

### Prerequisites

- Node.js 20+
- A PostgreSQL database (or use Docker Compose which bundles one)
- GitHub OAuth App credentials
- Anthropic API key (for Claude-powered analysis)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USER/sentinel.git
cd sentinel
npm install
```

Sentinel depends on `pentest-audit` as a local package. Clone it alongside:

```bash
cd ..
git clone https://github.com/YOUR_USER/pentest-audit.git
cd pentest-audit && npm install && npm run build && cd ../sentinel
```

### 2. Configure environment

Copy `.env.example` or create `.env.local`:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="openssl rand -base64 32"
AUTH_GITHUB_ID="your-github-oauth-app-id"
AUTH_GITHUB_SECRET="your-github-oauth-app-secret"
ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with GitHub, and start scanning.

## Docker Deployment

Docker Compose spins up Sentinel + PostgreSQL. Clone both repos side by side:

```
parent/
  pentest-audit/
  sentinel/
```

Create a `.env` file in `sentinel/`:

```env
AUTH_SECRET="run: openssl rand -base64 32"
AUTH_GITHUB_ID="your-github-oauth-app-id"
AUTH_GITHUB_SECRET="your-github-oauth-app-secret"
ANTHROPIC_API_KEY="sk-ant-..."
```

No `DATABASE_URL` needed — Docker Compose provides a bundled PostgreSQL automatically.

### With security tools (full image)

Includes all 25+ external tools (Nuclei, Nmap, SQLMap, etc.). Takes longer to build but enables the full tool suite.

```bash
cd sentinel
docker compose up --build -d
```

### Without security tools (lightweight)

Just the UI + AI code analysis + built-in URL scanner. Much faster build.

```bash
cd sentinel
docker compose build --build-arg INSTALL_TOOLS=false sentinel
docker compose up -d
```

### Using an external database (RDS, Neon, etc.)

Add `DATABASE_URL` to your `.env` file and remove the `db` service from `docker-compose.yml`. Prisma auto-migrates on startup — works with any PostgreSQL instance.

### Included security tools

Nuclei, Subfinder, httpx, Nmap, FFuf, Gobuster, Feroxbuster, TruffleHog, Gitleaks, TestSSL, Nikto, Dalfox, WhatWeb, Wafw00f, Arjun, ParamSpider, SQLMap, Hydra, Commix, SSLyze, WPScan, and SecLists wordlists.

## Architecture

```
sentinel/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # REST API routes (scans, repos, tools, auth)
│   │   ├── dashboard/        # Dashboard pages (repos, scans, tools, settings)
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   ├── dashboard/        # Repo detail, scan results, tools overview
│   │   ├── layout/           # Sidebar navigation
│   │   └── ui/               # Score ring, badges, empty states
│   └── lib/                  # Core logic
│       ├── auth.ts           # NextAuth GitHub provider
│       ├── scanner.ts        # Scan orchestration (calls pentest-audit)
│       ├── schemas.ts        # Zod validation schemas
│       └── prisma.ts         # Database client
├── prisma/schema.prisma      # Database schema
├── Dockerfile                # Multi-stage build with all security tools
└── docs/USER_GUIDE.md        # Detailed usage documentation
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Auth**: NextAuth v5 (GitHub OAuth)
- **Database**: PostgreSQL via Prisma 7
- **Scanning Engine**: pentest-audit (local library)
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS v4
- **Validation**: Zod 4

## Documentation

See [docs/USER_GUIDE.md](docs/USER_GUIDE.md) for detailed documentation on:
- Scan profiles (passive, active, exploit)
- All configuration options
- URL scanner checks
- External tool descriptions
- Compliance frameworks

## License

MIT
