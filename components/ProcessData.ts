// Define interfaces for your data structures
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

interface PlatformData {
  steam: Player[];
  xbox: Player[];
  psn: Player[];
  crossplay: Player[];
  [key: string]: Player[]; // Adding index signature
}

interface Statistics {
  count: number;
  averageCashouts: number | null;
}
// Function to separate data by platform

export const separateDataByPlatform = (data: Player[]): PlatformData => {
  const platforms: PlatformData = {
    steam: [],
    xbox: [],
    psn: [],
    crossplay: [], // Assuming crossplay might have its own identification method
  };

  data.forEach((item) => {
    if (item.steamName) platforms.steam.push(item);
    if (item.xboxName) platforms.xbox.push(item);
    if (item.psnName) platforms.psn.push(item);
    // Assuming crossplay might be identified differently or as a combination
  });

  return platforms;
};

// Function to calculate averages for a given platform
export const calculateAverageCashouts = (players: Player[]): Statistics => {
  if (!players.length) return { count: 0, averageCashouts: null };

  const totalCashouts = players.reduce(
    (sum, player) => sum + player.cashouts,
    0
  );
  const averageCashouts = totalCashouts / players.length;

  return {
    count: players.length,
    averageCashouts,
  };
};

// Function to find the most common rank
export const mostCommonRank = (players: Player[]): string | null => {
  if (players.length === 0) {
    return null;
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

  return mostCommonRankNumber !== null
    ? rankNameMapping[mostCommonRankNumber]
    : null;
};

// Function to process all statistics
export const processStatistics = (
  rawData: Player[]
): { [key: string]: Statistics } => {
  const dataByPlatform = separateDataByPlatform(rawData);

  const statistics: { [key: string]: Statistics } = {};
  Object.keys(dataByPlatform).forEach((platform) => {
    statistics[platform] = calculateAverageCashouts(dataByPlatform[platform]);
  });
  console.log("Error in process Statistcs");
  return statistics;
};

// "data":[{
// "rank":1,
// "change":0,
// "leagueNumber":20,
// "league":"Diamond 1",
// "name":"BaliseTV#6454",
// "steamName":"BaliseTV",
// "xboxName":"",
// "psnName":""
// ,"cashouts":0}
