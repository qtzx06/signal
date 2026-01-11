export interface UserStock {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    createdAt: string;
    followers: number;
    following: number;
    totalRepos: number;
    totalStars: number;
    contributions: {
      total: number;
      commits: number;
      prs: number;
      issues: number;
    };
  };
  stock: {
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
  };
}
