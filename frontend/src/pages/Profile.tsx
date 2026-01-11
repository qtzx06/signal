import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { fetchUserStock } from '../lib/api';
import type { UserStock } from '../lib/types';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<UserStock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError(null);

    fetchUserStock(username)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#0a0a0a' },
        textColor: '#999',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      timeScale: {
        borderColor: '#333',
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff00',
      downColor: '#ff0000',
      borderUpColor: '#00ff00',
      borderDownColor: '#ff0000',
      wickUpColor: '#00ff00',
      wickDownColor: '#ff0000',
    });

    const chartData = data.stock.candlesticks.map((c) => ({
      time: c.date,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candlestickSeries.setData(chartData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          Go Back
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { user, stock } = data;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back
        </button>
      </div>

      {/* User Info + Price */}
      <div style={styles.hero}>
        <img src={user.avatarUrl} alt={user.login} style={styles.avatar} />
        <div style={styles.userInfo}>
          <h1 style={styles.name}>{user.name || user.login}</h1>
          <div style={styles.username}>@{user.login}</div>
        </div>
        <div style={styles.priceBlock}>
          <div
            style={{
              ...styles.price,
              color:
                stock.changeDirection === 'up'
                  ? '#00ff00'
                  : stock.changeDirection === 'down'
                  ? '#ff0000'
                  : '#fff',
            }}
          >
            ${stock.price.toFixed(2)}
          </div>
          <div
            style={{
              ...styles.change,
              color:
                stock.changeDirection === 'up'
                  ? '#00ff00'
                  : stock.changeDirection === 'down'
                  ? '#ff0000'
                  : '#888',
            }}
          >
            {stock.change > 0 ? '+' : ''}
            {stock.change.toFixed(2)}% today
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={styles.chartContainer} ref={chartRef} />

      {/* Metrics */}
      <div style={styles.metricsGrid}>
        {Object.entries(stock.metrics).map(([key, value]) => (
          <div key={key} style={styles.metricCard}>
            <div style={styles.metricValue}>{value.toFixed(0)}</div>
            <div style={styles.metricLabel}>{key}</div>
            <div style={styles.metricBar}>
              <div
                style={{
                  ...styles.metricFill,
                  width: `${value}%`,
                  background:
                    value > 70 ? '#00ff00' : value > 40 ? '#ffff00' : '#ff4444',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{user.followers.toLocaleString()}</span>
          <span style={styles.statLabel}>Followers</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{user.totalStars.toLocaleString()}</span>
          <span style={styles.statLabel}>Stars</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{user.totalRepos}</span>
          <span style={styles.statLabel}>Repos</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>
            {user.contributions.total.toLocaleString()}
          </span>
          <span style={styles.statLabel}>Contributions</span>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '100px 0',
    fontSize: '18px',
    color: '#888',
  },
  error: {
    textAlign: 'center',
    padding: '100px 0',
    fontSize: '18px',
    color: '#ff4444',
  },
  header: {
    marginBottom: '30px',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#fff',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  username: {
    color: '#888',
    fontSize: '16px',
  },
  priceBlock: {
    textAlign: 'right',
  },
  price: {
    fontSize: '48px',
    fontWeight: 'bold',
  },
  change: {
    fontSize: '16px',
  },
  chartContainer: {
    marginBottom: '30px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '15px',
    marginBottom: '30px',
  },
  metricCard: {
    background: '#1a1a1a',
    padding: '20px',
    textAlign: 'center',
    borderRadius: '8px',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
    marginTop: '5px',
  },
  metricBar: {
    marginTop: '10px',
    height: '4px',
    background: '#333',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
  },
  stat: {
    background: '#1a1a1a',
    padding: '20px',
    textAlign: 'center',
    borderRadius: '8px',
  },
  statValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
  },
};
