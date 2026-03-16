import { RepoList } from "@/components/dashboard/repo-list";

export default function DashboardPage() {
  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Repositories
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Select a repository to view scans or start a new one
        </p>
      </div>
      <RepoList />
    </div>
  );
}
