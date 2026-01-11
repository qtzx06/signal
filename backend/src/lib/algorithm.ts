// SIGNAL Stock Price Algorithm
// Converts GitHub data into a stock price from $1 to $500

import type { GitHubUserData, StockData } from './types.js';
export type { GitHubUserData, StockData } from './types.js';

// Scoring weights - these determine how much each factor matters
const WEIGHTS = {
  volume: 0.25,      // How much they commit
  consistency: 0.25, // How regularly they commit
  recognition: 0.20, // Stars on repos
  socialProof: 0.15, // Followers
  momentum: 0.15,    // Trending up or down
};

// Baselines for normalization (based on "good" developer benchmarks)
const BASELINES = {
  yearlyContributions: 1000,  // 1000 contributions/year is solid
  dailyStreak: 30,            // 30 day streak is impressive
  activeRatio: 0.6,           // 60% of days active is great
  stars: 1000,                // 1000 total stars is notable
  topRepoStars: 500,          // 500 stars on best repo
  followers: 500,             // 500 followers is solid
};

/**
 * Calculate volume score (0-100)
 * Based on total contributions in the past year
 */
function calculateVolumeScore(data: GitHubUserData): number {
  const contributions = data.contributions.total;
  // Log scale to handle outliers (Torvalds has 3000+, most have < 500)
  const normalized = Math.log10(contributions + 1) / Math.log10(BASELINES.yearlyContributions + 1);
  return Math.min(100, normalized * 100);
}

/**
 * Calculate consistency score (0-100)
 * Based on streaks and daily activity ratio
 */
function calculateConsistencyScore(data: GitHubUserData): number {
  const days = data.contributionDays;

  // Calculate current streak
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const day of days) {
    if (day.count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate active day ratio
  const activeDays = days.filter(d => d.count > 0).length;
  const activeRatio = activeDays / days.length;

  // Combine metrics
  const streakScore = Math.min(100, (longestStreak / BASELINES.dailyStreak) * 50);
  const ratioScore = Math.min(100, (activeRatio / BASELINES.activeRatio) * 50);

  return streakScore + ratioScore;
}

/**
 * Calculate recognition score (0-100)
 * Based on stars across repos
 */
function calculateRecognitionScore(data: GitHubUserData): number {
  // Log scale for stars (some people have millions)
  const totalStarsScore = Math.log10(data.totalStars + 1) / Math.log10(BASELINES.stars + 1);
  const topRepoScore = Math.log10(data.topRepoStars + 1) / Math.log10(BASELINES.topRepoStars + 1);

  // Weight total stars more than single repo
  const combined = (totalStarsScore * 0.7 + topRepoScore * 0.3) * 100;
  return Math.min(100, combined);
}

/**
 * Calculate social proof score (0-100)
 * Based on followers
 */
function calculateSocialProofScore(data: GitHubUserData): number {
  // Log scale for followers
  const normalized = Math.log10(data.followers + 1) / Math.log10(BASELINES.followers + 1);
  return Math.min(100, normalized * 100);
}

/**
 * Calculate momentum score (0-100)
 * Compare recent activity to past activity
 */
function calculateMomentumScore(data: GitHubUserData): number {
  const days = data.contributionDays;

  // Compare last 30 days to previous 30 days
  const recent30 = days.slice(-30);
  const previous30 = days.slice(-60, -30);

  const recentTotal = recent30.reduce((sum, d) => sum + d.count, 0);
  const previousTotal = previous30.reduce((sum, d) => sum + d.count, 0);

  if (previousTotal === 0) {
    return recentTotal > 0 ? 75 : 50; // New activity vs no activity
  }

  const changeRatio = recentTotal / previousTotal;

  // 1.0 = no change = 50 points
  // 2.0 = doubled = 100 points
  // 0.5 = halved = 0 points
  const score = 50 + (changeRatio - 1) * 50;
  return Math.max(0, Math.min(100, score));
}

/**
 * Check if a date is a weekend (Sat/Sun)
 */
function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

/**
 * Calculate reputation multiplier (1.0x - 1.25x)
 * Based on stars + followers - higher rep = greens hit slightly harder
 * Reduced from 1.5x to prevent exponential blowup
 */
function getReputationMultiplier(data: GitHubUserData): number {
  const starsScore = Math.log10(data.totalStars + 1) / Math.log10(50000); // 50k stars = 1.0
  const followersScore = Math.log10(data.followers + 1) / Math.log10(10000); // 10k followers = 1.0

  // Combine and normalize to 0-1 range
  const combined = (starsScore * 0.6 + followersScore * 0.4);
  const normalized = Math.min(1, Math.max(0, combined));

  // Return multiplier between 1.0x and 1.25x (reduced from 1.5x)
  return 1.0 + (normalized * 0.25);
}

/**
 * Convert contribution days to candlestick data
 * - Trims leading zero days (starts at first contribution)
 * - IPO price based on first week's average activity
 * - Weekends: neutral (no penalty)
 * - Graduated penalty for consecutive inactive days
 * - Weekly loss capped at -8%
 */
function generateCandlesticks(data: GitHubUserData): StockData['candlesticks'] {
  const allDays = data.contributionDays;

  // Find first day with contributions (trim leading zeros)
  const firstActiveIndex = allDays.findIndex(d => d.count > 0);
  if (firstActiveIndex === -1) {
    return allDays.slice(-7).map(day => ({
      date: day.date,
      open: 1,
      high: 1,
      low: 1,
      close: 1,
      volume: 0,
      isGreen: false,
    }));
  }

  const days = allDays.slice(firstActiveIndex);

  // Calculate IPO price based on first week's activity
  const firstWeek = days.slice(0, 7);
  const firstWeekAvg = firstWeek.reduce((sum, d) => sum + d.count, 0) / firstWeek.length;
  const ipoPrice = 5 + Math.min(45, firstWeekAvg * 3);

  let runningPrice = ipoPrice;

  // Reputation multiplier - stars/followers boost gains
  const repMultiplier = getReputationMultiplier(data);

  // Track cumulative contributions for milestone detection
  let cumulativeContribs = 0;
  const milestones = [100, 500, 1000, 2500, 5000];
  let nextMilestoneIndex = 0;

  return days.map((day, index) => {
    const count = day.count;

    // === ROLLING 7-DAY WINDOW ===
    // Look at past 7 days instead of just today
    const past7Days = days.slice(Math.max(0, index - 6), index + 1);
    const rolling7DayTotal = past7Days.reduce((sum, d) => sum + d.count, 0);
    const rolling7DayAvg = rolling7DayTotal / past7Days.length;

    // Also check past 14 days for "prolonged inactivity" detection
    const past14Days = days.slice(Math.max(0, index - 13), index + 1);
    const rolling14DayTotal = past14Days.reduce((sum, d) => sum + d.count, 0);

    let priceChange = 0;
    let milestoneBoost = 0;

    // Check for milestone hits
    if (count > 0) {
      const prevCumulative = cumulativeContribs;
      cumulativeContribs += count;

      while (nextMilestoneIndex < milestones.length &&
             prevCumulative < milestones[nextMilestoneIndex] &&
             cumulativeContribs >= milestones[nextMilestoneIndex]) {
        milestoneBoost += 2 + nextMilestoneIndex;
        nextMilestoneIndex++;
      }
    }

    // === NEW LOGIC: Based on rolling average, not daily ===
    if (rolling7DayTotal >= 10) {
      // Active week (10+ contributions in 7 days) = solid growth
      const intensity = Math.min(1, Math.log10(rolling7DayAvg + 1) / Math.log10(10));
      const baseGain = 2.0 * intensity * repMultiplier;
      const diminishingFactor = Math.max(0.4, 1 - (runningPrice / 800));
      priceChange = (baseGain * diminishingFactor) + (milestoneBoost * 0.5);

    } else if (rolling7DayTotal >= 3) {
      // Light week (3-9 contributions) = small growth or flat
      const intensity = rolling7DayTotal / 10;
      priceChange = 0.5 * intensity * repMultiplier;

    } else if (rolling14DayTotal === 0) {
      // Prolonged inactivity (nothing in 14 days) = gradual decline
      // Flat drop, not percentage
      priceChange = -0.3; // Small flat penalty

    } else {
      // Cooling off (< 3 in past week but some activity in past 14 days)
      // Stay flat - no penalty, no gain
      priceChange = 0;
    }

    const open = runningPrice;
    let close;

    if (priceChange < 0) {
      // Negative = flat drop
      close = runningPrice + priceChange;
    } else {
      // Positive = percentage gain
      close = runningPrice * (1 + priceChange / 100);
    }

    // Floor at $1, no cap
    close = Math.max(1, close);
    runningPrice = close;

    // OHLC variance for visual interest
    const variance = Math.abs(close - open) * 0.3 + 0.1;
    const high = Math.max(open, close) + variance;
    const low = Math.min(open, close) - variance * 0.5;

    return {
      date: day.date,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: count,
      isGreen: count > 0,
    };
  });
}

/**
 * Main algorithm: Convert GitHub data to stock price
 */
export function calculateStockPrice(data: GitHubUserData): StockData {
  // Calculate individual scores (for display, not price)
  const metrics = {
    volume: calculateVolumeScore(data),
    consistency: calculateConsistencyScore(data),
    recognition: calculateRecognitionScore(data),
    socialProof: calculateSocialProofScore(data),
    momentum: calculateMomentumScore(data),
  };

  // Generate candlesticks - price IS the chart's final price
  const candlesticks = generateCandlesticks(data);
  const lastCandle = candlesticks[candlesticks.length - 1];
  const prevCandle = candlesticks[candlesticks.length - 2];

  // Stock price = where the chart ends
  const price = lastCandle.close;

  // Daily change
  const change = prevCandle
    ? ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100
    : 0;

  return {
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changeDirection: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'neutral',
    metrics,
    candlesticks,
  };
}

/**
 * Debug: Print breakdown of score calculation
 */
export function debugScoreBreakdown(data: GitHubUserData): void {
  const metrics = {
    volume: calculateVolumeScore(data),
    consistency: calculateConsistencyScore(data),
    recognition: calculateRecognitionScore(data),
    socialProof: calculateSocialProofScore(data),
    momentum: calculateMomentumScore(data),
  };

  console.log('=== SIGNAL Score Breakdown ===');
  console.log(`User: ${data.login}`);
  console.log('');
  console.log('Metrics (0-100):');
  console.log(`  Volume:      ${metrics.volume.toFixed(1)} (weight: ${WEIGHTS.volume})`);
  console.log(`  Consistency: ${metrics.consistency.toFixed(1)} (weight: ${WEIGHTS.consistency})`);
  console.log(`  Recognition: ${metrics.recognition.toFixed(1)} (weight: ${WEIGHTS.recognition})`);
  console.log(`  Social:      ${metrics.socialProof.toFixed(1)} (weight: ${WEIGHTS.socialProof})`);
  console.log(`  Momentum:    ${metrics.momentum.toFixed(1)} (weight: ${WEIGHTS.momentum})`);
  console.log('');

  const weighted =
    metrics.volume * WEIGHTS.volume +
    metrics.consistency * WEIGHTS.consistency +
    metrics.recognition * WEIGHTS.recognition +
    metrics.socialProof * WEIGHTS.socialProof +
    metrics.momentum * WEIGHTS.momentum;

  console.log(`Weighted Score: ${weighted.toFixed(1)}/100`);

  const price = 1 + (499 * Math.pow(weighted / 100, 1.5));
  console.log(`Stock Price: $${price.toFixed(2)}`);
}
