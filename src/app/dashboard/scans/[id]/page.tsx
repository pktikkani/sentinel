import { ScanResults } from "@/components/scan/scan-results";

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="px-8 py-8 max-w-4xl">
      <ScanResults scanId={id} />
    </div>
  );
}
