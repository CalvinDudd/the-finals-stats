import React, { useState, useEffect } from "react";

const StatsDisplay = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats"); // Make sure the endpoint is correct
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load data: " + err.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading statistics...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>THE FINALS Player Statistics</h1>
      {Object.keys(stats).map((platform) => (
        <div key={platform}>
          <h2>{platform.toUpperCase()} Statistics</h2>
          <p>Average Cashouts: {stats[platform]?.averageCashouts}</p>
          <p>Most Common Rank: {stats[platform]?.mostCommonRank}</p>
          <p>Average Rank: {stats[platform]?.averageRank}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsDisplay;
