import { ScanHistory } from "@/components/dashboard/scan-history";

export default function ScansPage() {
  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Scan History
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          All scans across your repositories
        </p>
      </div>
      <ScanHistory />
    </div>
  );
}
