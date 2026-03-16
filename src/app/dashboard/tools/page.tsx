import { ToolsOverview } from "@/components/dashboard/tools-overview";

export default function ToolsPage() {
  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Security Tools
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          External tools available on this Sentinel instance
        </p>
      </div>
      <ToolsOverview />
    </div>
  );
}
