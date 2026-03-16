export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  html_url: string;
  description: string | null;
  language: string | null;
  default_branch: string;
  private: boolean;
  fork: boolean;
  stargazers_count: number;
  updated_at: string;
  pushed_at: string;
}

export async function fetchUserRepos(
  accessToken: string,
  page = 1,
  perPage = 30
): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/user/repos?sort=pushed&per_page=${perPage}&page=${page}&type=all`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchRepoBranches(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{ name: string; protected: boolean }[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchRepoLanguages(
  accessToken: string,
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/languages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) return {};
  return res.json();
}
