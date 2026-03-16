import { auth } from "@/lib/auth";
import { Shield, Github, Key } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your Sentinel configuration
        </p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Github className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">GitHub Account</h2>
          </div>
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-10 h-10 rounded-full ring-1 ring-zinc-200 dark:ring-sentinel-700/50"
              />
            )}
            <div>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">{session?.user?.name}</p>
              <p className="text-[12px] text-zinc-500">{session?.user?.email}</p>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-zinc-400 dark:text-zinc-600">
            Authenticated via GitHub OAuth with repo access scope.
          </p>
        </div>

        {/* API Keys info */}
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">API Configuration</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-zinc-600 dark:text-zinc-400">Anthropic API Key</span>
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
                {process.env.ANTHROPIC_API_KEY ? "Configured" : "Not set"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-zinc-600 dark:text-zinc-400">pentest-audit CLI</span>
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
                {process.env.PENTEST_AUDIT_CLI_PATH || "npx pentest-audit"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-zinc-400 dark:text-zinc-600">
            API keys are configured via environment variables on the server.
          </p>
        </div>

        {/* About */}
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-sentinel-800/40 bg-white dark:bg-sentinel-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-sentinel-500 dark:text-sentinel-400" />
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">About Sentinel</h2>
          </div>
          <div className="space-y-1 text-[12px] text-zinc-500 font-mono">
            <p>Sentinel v0.1.0</p>
            <p>Powered by pentest-audit CLI</p>
            <p>AI analysis via Claude (Anthropic)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
