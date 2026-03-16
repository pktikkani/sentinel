import { Shield, Github } from "lucide-react";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-sentinel-950">
      <div className="grid-bg fixed inset-0 pointer-events-none" />
      <div className="radial-fade fixed inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-zinc-200 dark:border-sentinel-700/50 bg-zinc-50 dark:bg-sentinel-900/50 mb-6">
            <Shield className="w-6 h-6 text-sentinel-500 dark:text-sentinel-400" strokeWidth={1.5} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign in to Sentinel
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Authenticate with GitHub to access your repositories
          </p>

          <form
            className="w-full mt-8"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-zinc-900 dark:bg-white/[0.05] border border-zinc-900 dark:border-white/[0.08] text-sm font-medium text-white dark:text-zinc-200 transition-all duration-200 hover:bg-zinc-800 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <Github className="w-4 h-4" />
              Continue with GitHub
            </button>
          </form>

          <p className="mt-6 font-mono text-[11px] text-zinc-400 dark:text-zinc-700 tracking-wider">
            We request repo access to clone and scan your code.
            <br />
            Your code never leaves your infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}
