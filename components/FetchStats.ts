// pages/api/stats.ts
import { useEffect, useState } from "react";
import { processStatistics } from "./ProcessData"; // Adjust the path as necessary

interface ApiResponse {
  meta: {
    leaderboardVersion: string;
    leaderboardPlatform: string;
    returnRawData: boolean;
    returnCountOnly: boolean;
  };
  count: number;
  data: Player[];
}

interface Player {
  rank: number;
  change: number;
  leagueNumber: number;
  league: string;
  name: string;
  steamName: string;
  xboxName: string;
  psnName: string;
  cashouts: number;
}

const fetchPlatformStats = async (platformUrl: string): Promise<Player[]> => {
  const response = await fetch(platformUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${platformUrl}`);
  }
  const jsonResponse: ApiResponse = await response.json();
  return jsonResponse.data; // Return only the player data array
};

const [stats, setStats] = useState<Player[]>([]); // Specify the type of the state here
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const urls = [
        "https://api.the-finals-leaderboard.com/v1/leaderboard/season2/xbox",
        "https://api.the-finals-leaderboard.com/v1/leaderboard/season2/psn",
        "https://api.the-finals-leaderboard.com/v1/leaderboard/season2/steam",
        "https://api.the-finals-leaderboard.com/v1/leaderboard/season2/crossplay",
      ];
      const promises = urls.map((url) => fetchPlatformStats(url));
      const results = await Promise.all(promises);
      const combinedStats = results.flat(); // Combine stats from all platforms
      setStats(combinedStats); // No error now, as types are matching
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

export default combinedStats;
