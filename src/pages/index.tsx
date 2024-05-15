import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Image,
} from "@chakra-ui/react";

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

const computeStatisticsForPlatform = (data: Player[]): Statistics => {
  const averageCashoutsResult = calculateAverageCashouts(data);
  const mostCommonRankResult = mostCommonRank(data);

  return {
    count: data.length,
    averageCashouts: averageCashoutsResult.averageCashouts,
    mostCommonRank: mostCommonRankResult.mostCommonRank,
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
          crossplay: results[0].data.slice(0, 50),
          steam: results[1].data.slice(0, 50),
          psn: results[2].data.slice(0, 50),
          xbox: results[3].data.slice(0, 50),
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

  return (
    <Box width="100%" minHeight="100vh" backgroundColor="#1A202C">
      <Flex
        width="100%"
        backgroundColor="#1A202C"
        color="white"
        padding="20px"
        justifyContent="center"
        alignItems="center"
        marginBottom="20px"
      >
        <Flex alignItems="center" backgroundColor="#2D3748" rounded={10}>
          <Image
            src="../thefinals_web_thefinals_small_01 (1).png"
            alt="temp-logo"
            height="50px"
            marginRight="20px"
          />
          <Heading
            as="h1"
            size="xl"
            fontFamily="'Saira Ultra Condensed', sans-serif"
          >
            Leaderboard & Stats
          </Heading>
        </Flex>
      </Flex>
      <Flex
        className="Stats Output"
        justifyContent="space-around"
        alignItems="flex-start"
        flexWrap="wrap"
        padding="20px"
        backgroundColor="#1A202C"
      >
        {Object.entries(platformStats).map(([platformKey, platformData]) => (
          <Box
            key={platformKey}
            width={{ base: "100%", md: "calc(25% - 20px)" }} // Four columns on larger screens
            margin="15px" // Distance between Platforms and Header
            backgroundColor={platformColors[platformKey]}
            color="#6B46C1" // Rank / Player / League Text
            rounded={25} // Rounded corners for the platform box
            overflow="hidden" // Hide overflow for rounded corners
            fontWeight="bold"
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
          >
            <Box padding="4">
              <Heading
                as="h2"
                textAlign="center"
                color="white"
                fontFamily="'Saira', sans-serif"
                marginBottom={4}
              >
                {platformKey.toUpperCase()}
              </Heading>
              <Text
                fontFamily="'Saira', sans-serif"
                textAlign="center"
                color="white"
                marginBottom={2}
              >
                Players:{" "}
                {platformStats[platformKey as keyof PlatformStatistics].count}
              </Text>
              <Text
                fontFamily="'Saira', sans-serif"
                textAlign="center"
                color="white"
                marginBottom={2}
              >
                Avg Cashouts:{" "}
                {platformStats[
                  platformKey as keyof PlatformStatistics
                ].averageCashouts?.toFixed(2)}
              </Text>
              <Text
                fontFamily="'Saira', sans-serif"
                textAlign="center"
                color="white"
              >
                Avg Rank:{" "}
                {
                  platformStats[platformKey as keyof PlatformStatistics]
                    .mostCommonRank
                }
              </Text>
            </Box>
            <List
              rounded={25}
              margin="5px"
              spacing="3"
              px="10"
              pb="4"
              backgroundColor="black"
              fontFamily="'Saira Ultra Condensed', sans-serif"
            >
              {stats[platformKey as keyof typeof stats].map((player, index) => (
                <ListItem key={index} padding="10px">
                  <Box
                    backgroundColor={"#171923"}
                    padding="5px"
                    borderRadius="md"
                    rounded={25}
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text
                        textAlign="left"
                        flex="1"
                        color="#553C9A"
                        fontSize="large"
                      >
                        #{player.rank}
                      </Text>
                      <Text
                        textAlign="center"
                        flex="1"
                        color="#553C9A"
                        fontSize="large"
                      >
                        {player.name}
                      </Text>
                      <Text
                        textAlign="right"
                        flex="1"
                        color="#553C9A"
                        fontSize="large"
                      >
                        {player.league}
                      </Text>
                    </Flex>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

const platformColors = {
  crossplay: "#FF6F00", // Example color, replace with actual colors
  steam: "#1B2838", // Example color, replace with actual colors
  psn: "#004DBB", // Example color, replace with actual colors
  xbox: "#107C10", // Example color, replace with actual colors
};

const styleColors = {
  gray600: "#4A5568",
  gray700: "#2D3748",
  gray800: "#1A202C",
  purple700: "#553C9A",
  purple800: "#44337A",
};
