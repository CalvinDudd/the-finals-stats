import { useEffect, useState } from "react";

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

interface StatsData {
  crossplay: Player[];
  steam: Player[];
  psn: Player[];
  xbox: Player[];
}

interface Statistics {
  count: number;
  averageCashouts: number | null;
  mostCommonRank: string | null;
}

interface PlatformStatistics {
  crossplay: Statistics;
  steam: Statistics;
  psn: Statistics;
  xbox: Statistics;
}

const calculateAverageCashouts = (players: Player[]): Statistics => {
  if (!players.length)
    return { count: 0, averageCashouts: null, mostCommonRank: null };

  const totalCashouts = players.reduce(
    (sum, player) => sum + player.cashouts,
    0
  );
  const averageCashouts = totalCashouts / players.length;

  return {
    count: players.length,
    averageCashouts,
    mostCommonRank: null, // Added to align with the interface, though not calculated here
  };
};

// Function to find the most common rank
const mostCommonRank = (players: Player[]): Statistics => {
  if (players.length === 0) {
    return { count: 0, averageCashouts: null, mostCommonRank: null };
  }

  const rankFrequency: { [key: number]: number } = {};
  players.forEach((player) => {
    const rankNumber = player.leagueNumber;
    rankFrequency[rankNumber] = (rankFrequency[rankNumber] || 0) + 1;
  });

  let maxCount = 0;
  let mostCommonRankNumber: number | null = null;
  Object.keys(rankFrequency).forEach((key) => {
    const rankNumber = parseInt(key);
    if (rankFrequency[rankNumber] > maxCount) {
      maxCount = rankFrequency[rankNumber];
      mostCommonRankNumber = rankNumber;
    }
  });

  const rankNameMapping: { [key: number]: string } = {
    20: "Diamond I",
    19: "Diamond II",
    18: "Diamond III",
    17: "Diamond IV",
    16: "Platinum I",
    15: "Platinum II",
    14: "Platinum III",
    13: "Platinum IV",
    12: "Gold I",
    11: "Gold II",
    10: "Gold III",
    9: "Gold IV",
    8: "Silver I",
    7: "Silver II",
    6: "Silver III",
    5: "Silver IV",
    4: "Bronze I",
    3: "Bronze II",
    2: "Bronze III",
    1: "Bronze IV",
  };

  return {
    count: players.length,
    averageCashouts: null, // Not calculated here
    mostCommonRank:
      mostCommonRankNumber !== null
        ? rankNameMapping[mostCommonRankNumber]
        : null,
  };
};

export default function Home() {
  const URLs = [
    "https://api.the-finals-leaderboard.com/v1/leaderboard/season2/crossplay",
    "https://api.the-finals-leaderboard.com/v1/leaderboard/season2/steam",
    "https://api.the-finals-leaderboard.com/v1/leaderboard/season2/psn",
    "https://api.the-finals-leaderboard.com/v1/leaderboard/season2/xbox",
  ];

  const [stats, setStats] = useState<StatsData>({
    crossplay: [],
    steam: [],
    psn: [],
    xbox: [],
  });

  const [fullStats, setFullStats] = useState<StatsData>({
    crossplay: [],
    steam: [],
    psn: [],
    xbox: [],
  });

  const [platformStats, setPlatformStats] = useState<PlatformStatistics>({
    crossplay: { count: 0, averageCashouts: null, mostCommonRank: null },
    steam: { count: 0, averageCashouts: null, mostCommonRank: null },
    psn: { count: 0, averageCashouts: null, mostCommonRank: null },
    xbox: { count: 0, averageCashouts: null, mostCommonRank: null },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fetchPromises = URLs.map((url) =>
          fetch(url).then((response) => {
            if (!response.ok) throw new Error("Failed to fetch stats");
            return response.json();
          })
        );

        const results = await Promise.all(fetchPromises);

        const fullResults = {
          crossplay: results[0].data,
          steam: results[1].data,
          psn: results[2].data,
          xbox: results[3].data,
        };

        const slicedResults = {
          crossplay: results[0].data.slice(0, 100),
          steam: results[1].data.slice(0, 100),
          psn: results[2].data.slice(0, 100),
          xbox: results[3].data.slice(0, 100),
        };

        setFullStats(fullResults);
        setStats(slicedResults);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Optionally set an error state here to render an error message
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (
      fullStats.crossplay.length > 0 &&
      fullStats.steam.length > 0 &&
      fullStats.psn.length > 0 &&
      fullStats.xbox.length > 0
    ) {
      setPlatformStats({
        crossplay: computeStatisticsForPlatform(fullStats.crossplay),
        steam: computeStatisticsForPlatform(fullStats.steam),
        psn: computeStatisticsForPlatform(fullStats.psn),
        xbox: computeStatisticsForPlatform(fullStats.xbox),
      });
    }
  }, [fullStats]); // This effect is dependent on fullStats

  function computeStatisticsForPlatform(data: Player[]): Statistics {
    const averageCashoutsResult = calculateAverageCashouts(data);
    const mostCommonRankResult = mostCommonRank(data);

    return {
      count: data.length,
      averageCashouts: averageCashoutsResult.averageCashouts,
      mostCommonRank: mostCommonRankResult.mostCommonRank,
    };
  }

  return (
    <div
      className="Stats Output"
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      {Object.entries(platformStats).map(([platformKey, platformData]) => (
        <div
          key={platformKey}
          style={{
            flex: "1 1 20%",
            margin: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            padding: "20px",
          }}
        >
          <h2>{platformKey.toUpperCase()}</h2>
          <div>
            <p>Total Players Analyzed: {platformData.count}</p>
            <p>
              Average Cashouts:{" "}
              {platformData.averageCashouts
                ? platformData.averageCashouts.toFixed(2)
                : "N/A"}
            </p>
            <p>Most Common Rank: {platformData.mostCommonRank || "N/A"}</p>
          </div>
          <ul
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              listStyle: "none",
              padding: 0,
            }}
          >
            {stats[platformKey as keyof typeof stats].map((player, index) => (
              <li key={index} style={{ padding: "5px 0" }}>
                {player.name} - Rank: {player.rank}, League: {player.league},
                Cashouts: {player.cashouts}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
