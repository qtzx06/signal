// SIGNAL Types

export interface GitHubUserData {
  login: string;
  name: string | null;
  avatarUrl: string;
  createdAt: string;
  followers: number;
  following: number;
  totalRepos: number;
  totalStars: number;
  topRepoStars: number;
  contributions: {
    total: number;
    commits: number;
    prs: number;
    issues: number;
  };
  contributionDays: Array<{
    date: string;
    count: number;
  }>;
}

export interface StockData {
  price: number;
  change: number;
  changeDirection: 'up' | 'down' | 'neutral';
  metrics: {
    volume: number;
    consistency: number;
    recognition: number;
    socialProof: number;
    momentum: number;
  };
  candlesticks: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    isGreen: boolean;
  }>;
}
