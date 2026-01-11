import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fetchGitHubUser } from './lib/github.js';
import { calculateStockPrice } from './lib/algorithm.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get user stock data
app.get('/api/user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    console.log(`Fetching data for: ${username}`);

    const userData = await fetchGitHubUser(username);
    const stockData = calculateStockPrice(userData);

    res.json({
      user: {
        login: userData.login,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        createdAt: userData.createdAt,
        followers: userData.followers,
        following: userData.following,
        totalRepos: userData.totalRepos,
        totalStars: userData.totalStars,
        contributions: userData.contributions,
      },
      stock: stockData,
    });
  } catch (error) {
    console.error(`Error fetching ${username}:`, error);

    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: `User not found: ${username}` });
    } else {
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`SIGNAL API running on http://localhost:${PORT}`);
});
