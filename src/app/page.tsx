import { Shield, GitBranch, Scan, Brain, Github } from "lucide-react";
import { signIn } from "@/lib/auth";

const features = [
  {
    icon: GitBranch,
    label: "GitHub Integration",
    mono: "REPOS",
    description:
      "Connect your repositories. Sentinel scans private and public repos using your GitHub credentials — zero config.",
  },
  {
    icon: Scan,
    label: "Deep Scanning",
    mono: "25+ TOOLS",
    description:
      "Orchestrates Nuclei, Semgrep, Trivy, Gitleaks, and 20+ scanners. Import existing SARIF/JSON artifacts or run tools directly.",
  },
  {
    icon: Brain,
    label: "AI Analysis",
    mono: "CLAUDE",
    description:
      "Multi-pass LLM enrichment powered by Claude. Code analysis, vulnerability correlation, and auto-remediation PRs.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-sentinel-950">
      {/* Grid background */}
      <div className="grid-bg fixed inset-0 pointer-events-none" />
      <div className="radial-fade fixed inset-0 pointer-events-none" />

      {/* Ambient glow — top center */}
      <div
        className="pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-[0.07]"
        style={{
          background:
            "radial-gradient(circle, #6366f1 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Nav */}
        <nav className="w-full max-w-5xl flex items-center justify-between py-6">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-sentinel-500 dark:text-sentinel-400" strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-wide text-zinc-600 dark:text-zinc-300">
              sentinel
            </span>
          </div>
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 tracking-wider">
            v0.1.0
          </span>
        </nav>

        {/* Hero */}
        <main className="flex flex-col items-center text-center mt-28 sm:mt-36 max-w-3xl">
          {/* Status badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-sentinel-700/60 bg-zinc-50 dark:bg-sentinel-900/50 mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
              Systems operational
            </span>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #6366f1 0%, #818cf8 30%, #a855f7 60%, #ec4899 100%)",
              }}
            >
              Sentinel
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-500 dark:text-zinc-500 max-w-lg leading-relaxed">
            AI-powered security intelligence for your code.
            <br className="hidden sm:block" />
            Scan repositories. Detect vulnerabilities. Ship safe.
          </p>

          {/* CTA */}
          <form
            className="mt-10"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-zinc-900 dark:bg-white/[0.05] border border-zinc-900 dark:border-white/[0.08] text-sm font-medium text-white dark:text-zinc-200 transition-all duration-200 hover:bg-zinc-800 dark:hover:bg-white/[0.08] hover:border-zinc-700 dark:hover:border-white/[0.12] cursor-pointer"
            >
              <Github className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              Sign in with GitHub
              <span className="ml-1 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 transition-colors group-hover:text-zinc-300 dark:group-hover:text-zinc-500">
                &#8594;
              </span>
            </button>
          </form>

          {/* Trust line */}
          <p className="mt-5 font-mono text-[11px] text-zinc-400 dark:text-zinc-700 tracking-wider">
            read-only access &middot; your code never leaves your infra
          </p>
        </main>

        {/* Feature cards */}
        <section className="w-full max-w-4xl mt-32 sm:mt-40 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 dark:bg-sentinel-700/30 rounded-xl overflow-hidden border border-zinc-200 dark:border-sentinel-700/40">
            {features.map((f) => (
              <div
                key={f.label}
                className="group bg-white dark:bg-sentinel-950/80 p-7 flex flex-col gap-4 transition-colors duration-300 hover:bg-zinc-50 dark:hover:bg-sentinel-900/60"
              >
                <div className="flex items-center justify-between">
                  <f.icon
                    className="w-4 h-4 text-sentinel-500/60 dark:text-sentinel-400/70 transition-colors group-hover:text-sentinel-500 dark:group-hover:text-sentinel-400"
                    strokeWidth={1.5}
                  />
                  <span className="font-mono text-[10px] text-zinc-400 dark:text-sentinel-600 tracking-widest">
                    {f.mono}
                  </span>
                </div>
                <h3 className="text-[15px] font-medium text-zinc-800 dark:text-zinc-200 tracking-tight">
                  {f.label}
                </h3>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full max-w-5xl border-t border-zinc-200 dark:border-sentinel-800/50 py-8 mb-4 flex items-center justify-between">
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-700">
            built on pentest-audit
          </span>
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-700">
            &copy; {new Date().getFullYear()}
          </span>
        </footer>
      </div>
    </div>
  );
}
