import { RepoDetail } from "@/components/dashboard/repo-detail";

export default async function RepoPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;

  return (
    <div className="px-8 py-8 max-w-4xl">
      <RepoDetail owner={owner} repo={repo} />
    </div>
  );
}
