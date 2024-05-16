import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Image,
  Link,
} from "@chakra-ui/react";

import "./styles.css"; // Ensure this path is correct

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

const getRankImagePath = (rank: string) => {
  const rankMapping: { [key: string]: string } = {
    "Diamond 1": "diamond-1.png",
    "Diamond 2": "diamond-2.png",
    "Diamond 3": "diamond-3.png",
    "Diamond 4": "diamond-4.png",
    "Platinum 1": "platinum-1.png",
    "Platinum 2": "platinum-2.png",
    "Platinum 3": "platinum-3.png",
    "Platinum 4": "platinum-4.png",
    "Gold 1": "gold-1.png",
    "Gold 2": "gold-2.png",
    "Gold 3": "gold-3.png",
    "Gold 4": "gold-4.png",
    "Silver 1": "silver-1.png",
    "Silver 2": "silver-2.png",
    "Silver 3": "silver-3.png",
    "Silver 4": "silver-4.png",
    "Bronze 1": "bronze-1.png",
    "Bronze 2": "bronze-2.png",
    "Bronze 3": "bronze-3.png",
    "Bronze 4": "bronze-4.png",
  };
  console.log(`Rank received: "${rank}"`);

  // Trim the rank and ensure case sensitivity
  const trimmedRank = rank.trim();

  const imagePath = rankMapping[trimmedRank];

  if (!imagePath) {
    console.error(`No image found for rank: "${trimmedRank}"`);
  }

  return `/${imagePath || "Embark.png"}`;
};

const getPlatformLogoPath = (platform: string) => {
  const logoMapping: { [key: string]: string } = {
    crossplay: "crossplay-logo.png",
    steam: "steam-logo.png",
    psn: "psn-logo.png",
    xbox: "xbox-logo.png",
  };

  return `/${logoMapping[platform] || "default-logo.png"}`;
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
    <Box
      width="100%"
      minHeight="100vh"
      backgroundColor="#1A202C"
      position="relative"
      overflowX="hidden"
    >
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
            src="/thefinals_web_thefinals_small_01 (1).png"
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
        justifyContent="space-between" /* Ensure boxes are spaced evenly */
        alignItems="flex-start"
        padding="20px"
        backgroundColor="#1A202C"
        flexWrap="nowrap" /* Prevent wrapping */
        overflowX="hidden" /* Prevent horizontal overflow */
      >
        {Object.entries(platformStats).map(([platformKey, platformData]) => (
          <Box
            key={platformKey}
            width="24%" /* Ensure four boxes fit within 100% width */
            margin="0 0.5%" /* Add a bit of margin between boxes */
            backgroundColor={platformColors[platformKey]}
            color="#6B46C1"
            rounded="25px"
            overflow="hidden"
            fontWeight="bold"
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
          >
            <Box padding="4">
              <Flex
                alignItems="center"
                justifyContent="center"
                marginBottom={4}
              >
                <Heading
                  as="h2"
                  textAlign="center"
                  color="white"
                  fontFamily="'Saira', sans-serif"
                  marginRight="10px"
                >
                  {platformKey.toUpperCase()}
                </Heading>
                <Image
                  src={getPlatformLogoPath(platformKey)}
                  alt={`${platformKey} logo`}
                  height="50px"
                />
              </Flex>
              <Text
                fontFamily="'Saira', sans-serif"
                textAlign="center"
                color="white"
                marginBottom={2}
              >
                Players Analyzed:{" "}
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
                Avg {platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}{" "}
                Rank:{" "}
                {
                  platformStats[platformKey as keyof PlatformStatistics]
                    .mostCommonRank
                }
              </Text>
            </Box>
            <List
              rounded="25px"
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
                    rounded="25px"
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text
                        fontFamily="'Saira Ultra Condensed', sans-serif"
                        textAlign="left"
                        flex="1"
                        color={
                          index === 0
                            ? "gold"
                            : index === 1
                            ? "silver"
                            : index === 2
                            ? "#cd7f32"
                            : "#553C9A"
                        }
                        fontSize="large"
                        overflowWrap="break-word" /* Ensure text wraps within the container */
                      >
                        #{player.rank}
                      </Text>
                      <Text
                        fontFamily="'Saira Ultra Condensed', sans-serif"
                        textAlign="center"
                        flex="1"
                        color="#553C9A"
                        fontSize="large"
                        overflowWrap="break-word" /* Ensure text wraps within the container */
                      >
                        {player.name}
                      </Text>
                      <Image
                        src={getRankImagePath(player.league)}
                        alt={player.league}
                        height="30px"
                        marginLeft="10px"
                      />
                    </Flex>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Flex>
      <Box padding="20px" textAlign="center" color="white">
        <Text fontSize="lg" fontFamily="'Saira Ultra Condensed', sans-serif">
          This page is not affiliated with <b>Embark Studios</b>, the studio
          behind <b>THE FINALS</b>. All images and data are their property.
        </Text>
        <Text fontSize="lg" mt="4">
          Created by <b>Pug</b>.{" "}
          <Link
            href="https://github.com/CalvinDudd/the-finals-stats"
            color="teal.500"
            isExternal
          >
            GitHub
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
