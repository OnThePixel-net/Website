// pages/users/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const UserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://api.example.com/users/${id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  return (
    <div>
      {userData ? (
        <div>
          <h1>User Details</h1>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
          <p>Roles: {userData.roles}</p>
          {/* Display other user stats */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserPage;
