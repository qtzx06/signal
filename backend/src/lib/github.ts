// GitHub API Service
// Fetches user data via GraphQL and transforms it for the algorithm

import type { GitHubUserData } from './types.js';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const USER_QUERY = `
  query($userName: String!) {
    user(login: $userName) {
      login
      name
      avatarUrl
      createdAt
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
        totalCount
        nodes {
          name
          stargazerCount
          forkCount
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoryContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

interface GraphQLResponse {
  data?: {
    user: {
      login: string;
      name: string | null;
      avatarUrl: string;
      createdAt: string;
      followers: { totalCount: number };
      following: { totalCount: number };
      repositories: {
        totalCount: number;
        nodes: Array<{
          name: string;
          stargazerCount: number;
          forkCount: number;
        }>;
      };
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalIssueContributions: number;
        totalRepositoryContributions: number;
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              contributionCount: number;
              date: string;
            }>;
          }>;
        };
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

export class GitHubAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

/**
 * Fetch user data from GitHub GraphQL API
 */
export async function fetchGitHubUser(username: string): Promise<GitHubUserData> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: USER_QUERY,
      variables: { userName: username },
    }),
  });

  if (!response.ok) {
    throw new GitHubAPIError(`GitHub API error: ${response.status}`, response.status);
  }

  const json: GraphQLResponse = await response.json();

  if (json.errors) {
    throw new GitHubAPIError(json.errors[0].message);
  }

  if (!json.data?.user) {
    throw new GitHubAPIError(`User not found: ${username}`);
  }

  const user = json.data.user;

  // Calculate total stars across all repos
  const totalStars = user.repositories.nodes.reduce(
    (sum, repo) => sum + repo.stargazerCount,
    0
  );

  // Get top repo stars
  const topRepoStars = user.repositories.nodes[0]?.stargazerCount ?? 0;

  // Flatten contribution days from weeks
  const contributionDays = user.contributionsCollection.contributionCalendar.weeks.flatMap(
    week => week.contributionDays.map(day => ({
      date: day.date,
      count: day.contributionCount,
    }))
  );

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    totalRepos: user.repositories.totalCount,
    totalStars,
    topRepoStars,
    contributions: {
      total: user.contributionsCollection.contributionCalendar.totalContributions,
      commits: user.contributionsCollection.totalCommitContributions,
      prs: user.contributionsCollection.totalPullRequestContributions,
      issues: user.contributionsCollection.totalIssueContributions,
    },
    contributionDays,
  };
}

/**
 * Check if a GitHub user exists (lighter query)
 */
export async function checkUserExists(username: string): Promise<boolean> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query($userName: String!) { user(login: $userName) { login } }`,
      variables: { userName: username },
    }),
  });

  if (!response.ok) return false;

  const json: GraphQLResponse = await response.json();
  return !!json.data?.user;
}
