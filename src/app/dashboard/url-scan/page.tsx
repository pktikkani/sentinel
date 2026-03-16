import { UrlScanView } from "@/components/dashboard/url-scan-view";

export default function UrlScanPage() {
  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          URL Scanner
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Scan live URLs for security headers, TLS issues, CORS misconfigurations, and more
        </p>
      </div>
      <UrlScanView />
    </div>
  );
}
