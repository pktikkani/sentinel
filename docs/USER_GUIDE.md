# Sentinel User Guide

## Table of Contents

- [Getting Started](#getting-started)
- [Scan Profiles](#scan-profiles)
- [Scan Configuration](#scan-configuration)
- [Built-in URL Scanner](#built-in-url-scanner)
- [External Security Tools](#external-security-tools)
- [Compliance Frameworks](#compliance-frameworks)
- [Understanding Results](#understanding-results)

---

## Getting Started

1. Sign in with your GitHub account
2. Your repositories appear on the dashboard
3. Click a repo to open the scan configuration
4. Click **Run Scan** to start

The scan clones your repo, analyzes the code with Claude AI, runs any enabled tools, and produces a security report with scored findings.

---

## Scan Profiles

Profiles control the **aggressiveness** of scanning. They affect which external tools run and how the built-in URL scanner behaves.

### Passive

Safe, read-only reconnaissance. No requests are sent to live targets beyond basic HTTP GETs. Use this for initial assessments or when you don't have explicit authorization to test.

**What runs:**
- Code analysis (AI-powered)
- SCA / dependency scanning
- License checking
- DNS lookups, security header checks, TLS certificate inspection
- Technology fingerprinting (WhatWeb, Wafw00f)
- Subdomain enumeration (Subfinder)
- HTTP probing (httpx)
- Parameter discovery from archives (ParamSpider, Arjun)
- SSL/TLS deep analysis (SSLyze)

**What does NOT run:**
- Directory brute-forcing
- Vulnerability exploitation
- Active probing of sensitive paths
- Open redirect testing

### Active

Standard penetration testing profile. Sends active probes to discover vulnerabilities but does not attempt exploitation. **Requires authorization** for live targets.

**Everything in Passive, plus:**
- Vulnerability scanning (Nuclei)
- Port scanning (Nmap)
- Directory/path brute-forcing (Gobuster, FFuf, Feroxbuster)
- Web server vulnerability scanning (Nikto)
- XSS scanning (Dalfox)
- Secret scanning in repos (TruffleHog, Gitleaks)
- SSL/TLS configuration testing (TestSSL)
- WordPress scanning (WPScan)
- Sensitive path probing (/.env, /.git, /phpinfo.php, etc.)
- HTTP method testing (PUT, DELETE, TRACE)
- Open redirect testing
- LLM security testing (Promptfoo, Garak)

### Exploit

Full offensive testing including exploitation attempts. **Only use with explicit written authorization.** This profile can modify data, attempt login brute-forcing, and run SQL injection payloads.

**Everything in Active, plus:**
- SQL injection detection and exploitation (SQLMap)
- Command injection testing (Commix)
- Login brute-forcing (Hydra)
- High-speed port scanning (Masscan)

---

## Scan Configuration

Open the **Config** panel on a repository page to access all options.

### Branch

Select which branch to scan. Sentinel fetches your repo's branch list via the GitHub API.

### Code Analysis

Controls how much AI-powered code analysis to run.

| Mode | Description |
|------|-------------|
| **Off** | Skip AI code analysis entirely. Only runs SCA, tools, and URL scanning. |
| **Focused** | Analyze security-critical files (auth, API routes, config, crypto). Fast and targeted. |
| **Full** | Analyze every file in the repository. Thorough but slower and uses more API credits. |

### Severity Filter

Minimum severity level for reported findings.

| Level | Shows |
|-------|-------|
| **Suggestion** | Everything — suggestions, warnings, and critical findings |
| **Warning** | Only warnings and critical findings |
| **Critical** | Only critical/high-severity findings |

### SCA (Software Composition Analysis)

When enabled, scans dependency manifests for known vulnerabilities:
- `package.json` / `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` (Node.js)
- `requirements.txt` / `Pipfile.lock` / `poetry.lock` / `uv.lock` / `pyproject.toml` (Python)
- `go.sum` (Go)
- `Cargo.lock` (Rust)
- `pom.xml` / `build.gradle` (Java)
- `composer.lock` (PHP)
- `Gemfile.lock` (Ruby)

### License Check

Checks dependency licenses against your chosen policy:

| Policy | Allows |
|--------|--------|
| **Commercial** | Permissive licenses (MIT, Apache, BSD). Flags copyleft (GPL, AGPL). |
| **Open Source** | All OSI-approved licenses. Flags proprietary/unknown. |
| **Permissive Only** | Only MIT, Apache 2.0, BSD, ISC. Flags everything else. |

### Multi-Pass

When enabled, the scanner runs a second AI analysis pass focused on the top findings from pass 1. This provides deeper investigation with specific remediation advice. The **Max Pass 2 Findings** slider (1-100, default 30) controls how many findings get the deep-dive treatment.

### URL Scan

Enables the built-in URL scanner against live targets. Enter comma-separated URLs in the **Targets** field (e.g., `https://example.com, https://api.example.com`).

### Run Tools

Enables external security tools. When toggled on, you can:
- Set a **Tool Timeout** (10-600 seconds per tool)
- Pick individual tools from the tool grid
- Use quick actions: "Select profile defaults", "Select all installed", or "Clear"

Tools that aren't installed on the server appear grayed out.

---

## Built-in URL Scanner

The URL scanner is a zero-dependency scanner built into pentest-audit. It runs 10 check categories against each target URL:

### 1. Security Headers
Checks for the presence of critical HTTP security headers:
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` (CSP)
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

### 2. Server Fingerprinting
Detects technology and version disclosure via `Server`, `X-Powered-By`, `X-AspNet-Version`, and similar headers.

### 3. Cookie Security
Checks `Set-Cookie` headers for missing `HttpOnly`, `Secure`, and `SameSite` attributes.

### 4. CORS Misconfiguration
Tests for dangerous CORS configurations:
- Wildcard `Access-Control-Allow-Origin: *` with credentials
- Origin reflection (server reflects arbitrary Origin headers)

### 5. TLS/SSL Certificate
Connects to port 443 and inspects:
- Certificate validity and expiration (warns if < 30 days)
- Self-signed certificates
- Weak protocols (SSLv3, TLS 1.0, TLS 1.1)

### 6. HTTP Methods (Active/Exploit only)
Sends an OPTIONS request to check for dangerous allowed methods: PUT, DELETE, TRACE, TRACK.

### 7. Sensitive Path Probing (Active/Exploit only)
Probes 30+ common sensitive paths including:
- `/.env`, `/.git/config`, `/.git/HEAD`
- `/phpinfo.php`, `/server-status`, `/server-info`
- `/swagger.json`, `/swagger-ui.html`, `/graphql`
- `/backup.sql`, `/dump.sql`, `/config.json`
- `/actuator`, `/elmah.axd`, `/console`
- `/wp-admin/`, `/wp-login.php`

### 8. Open Redirect Testing (Active/Exploit only)
Tests 12 common redirect parameters (`url`, `next`, `redirect`, `return`, `returnTo`, `continue`, `dest`, `destination`, `redir`, `redirect_uri`, `redirect_url`) for unvalidated redirects.

### 9. DNS Analysis
Resolves A, AAAA, MX, NS, TXT, and CNAME records. Checks for:
- Missing SPF record
- Missing or weak DMARC policy (p=none)
- Dangling CNAME records (subdomain takeover risk)

### 10. HTTPS Redirect
Checks whether HTTP (port 80) properly redirects to HTTPS.

---

## External Security Tools

Sentinel can run 25 external security tools. These are organized by risk level:

### Passive Tools (Safe, read-only)

| Tool | Binary | Description |
|------|--------|-------------|
| subfinder | `subfinder` | Subdomain enumeration via passive sources |
| httpx | `httpx` | HTTP probing and technology detection |
| whatweb | `whatweb` | Web technology fingerprinting |
| wafw00f | `wafw00f` | Web Application Firewall detection |
| arjun | `arjun` | HTTP parameter discovery |
| paramspider | `paramspider` | URL parameter mining from web archives |
| sslyze | `sslyze` | SSL/TLS deep analysis and certificate checking |

### Active Tools (Requires authorization)

| Tool | Binary | Description |
|------|--------|-------------|
| nuclei | `nuclei` | Template-based vulnerability scanner by ProjectDiscovery |
| nmap | `nmap` | Network port scanner and service detection |
| testssl | `testssl.sh` | SSL/TLS configuration analysis |
| gobuster | `gobuster` | Directory and vhost brute-force scanner |
| ffuf | `ffuf` | Fast web fuzzer for directory/parameter discovery |
| nikto | `nikto` | Web server vulnerability scanner |
| dalfox | `dalfox` | XSS vulnerability scanner and parameter analysis |
| trufflehog | `trufflehog` | Secret and credential scanning in files/repos |
| gitleaks | `gitleaks` | Git repository secret scanning |
| feroxbuster | `feroxbuster` | Recursive directory brute-forcer (Rust) |
| wpscan | `wpscan` | WordPress vulnerability scanner |
| jwt_tool | `jwt_tool` | JWT token analysis and manipulation testing |
| promptfoo | `promptfoo` | LLM prompt injection testing framework |
| garak | `garak` | LLM red-teaming and adversarial testing |

### Exploit Tools (Explicit authorization required)

| Tool | Binary | Description |
|------|--------|-------------|
| masscan | `masscan` | High-speed TCP port scanner |
| sqlmap | `sqlmap` | SQL injection detection and exploitation |
| hydra | `hydra` | Network login credential brute-forcer |
| commix | `commix` | Command injection detection and exploitation |

### Viewing Installed Tools

Navigate to **Tools** in the sidebar to see all available tools, their install status, and which profile they belong to. Missing tools appear with installation hints.

### Selecting Tools for a Scan

1. Open the **Config** panel on a repository
2. Toggle **Run Tools** to Enabled
3. The tool picker grid appears showing all tools
4. Click tools to select/deselect them
5. Use quick actions: "Select profile defaults" / "Select all installed" / "Clear"
6. Adjust the **Tool Timeout** slider (default: 120s per tool)

Only installed tools can be selected. Uninstalled tools appear grayed out.

---

## Compliance Frameworks

Sentinel maps security findings to industry compliance frameworks. Enable them in the Config panel.

| Framework | Description |
|-----------|-------------|
| **SOC 2** | Service Organization Control 2 — trust services criteria for security, availability, processing integrity |
| **PCI DSS** | Payment Card Industry Data Security Standard |
| **HIPAA** | Health Insurance Portability and Accountability Act — healthcare data protection |
| **NIST 800-53** | NIST Special Publication 800-53 — federal information system security controls |
| **GDPR** | General Data Protection Regulation — EU data privacy |
| **DPDPA** | Digital Personal Data Protection Act — India data privacy |
| **ISO 27001** | International standard for information security management systems |

The scan report groups findings by framework, showing which controls pass or fail.

---

## Understanding Results

### Security Score

Each scan produces a 0-100 security score. The score factors in:
- Number and severity of findings
- Confidence levels
- Whether critical infrastructure components are affected

### Finding Severity

| Level | Meaning |
|-------|---------|
| **Critical** | Exploitable vulnerability that could lead to data breach, RCE, or full compromise |
| **Warning** | Security weakness that should be addressed but may require specific conditions to exploit |
| **Suggestion** | Best practice recommendation or informational finding |

### Finding Details

Each finding includes:
- **Title** and description
- **CWE** (Common Weakness Enumeration) reference where applicable
- **OWASP** category mapping
- **Confidence** score (0-1)
- **Evidence** — code snippets, HTTP responses, or tool output
- **Remediation** — specific steps to fix the issue
- **Compliance** — which frameworks this finding relates to
