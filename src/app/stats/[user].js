import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const UserStats = () => {
  const router = useRouter();
  const { user } = router.query; // Holt den Benutzer aus der URL

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      // Führe hier eine API-Anfrage aus, um die Stats des Benutzers zu holen
      fetch(`/api/stats/${user}`)
        .then((response) => response.json())
        .then((data) => setStats(data))
        .catch((error) => console.error('Error fetching stats:', error));
    }
  }, [user]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Stats for {user}</h1>
      {stats ? (
        <div>
          <p>Score: {stats.score}</p>
          <p>Level: {stats.level}</p>
          <p>Rank: {stats.rank}</p>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}
    </div>
  );
};

export default UserStats;
