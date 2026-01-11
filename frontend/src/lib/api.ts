import type { UserStock } from './types';

const API_URL = 'http://localhost:3001';

export async function fetchUserStock(username: string): Promise<UserStock> {
  const res = await fetch(`${API_URL}/api/user/${username}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch');
  }
  return res.json();
}
