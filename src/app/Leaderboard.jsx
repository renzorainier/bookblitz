import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import leaderboardBg from ".//images/leaderboard.png";
import Image from "next/image";
import backgroundImage from ".//images/back.png";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fixedWidth, setFixedWidth] = useState("100vw");
  const [fixedHeight, setFixedHeight] = useState("100vh");

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef, orderBy("highScore", "desc"));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map((doc) => doc.data());
        setLeaderboardData(usersData);
      } catch (e) {
        console.error("Error fetching leaderboard data:", e);
        setError("Failed to fetch leaderboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const leaderboardContainerStyle = {
    width: fixedWidth,
    height: fixedHeight,
  };

  const textStyle = {
    fontSize: "1.5rem",
  };

  // Function to format seconds into "m s"
  const formatPlaytimeShort = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formattedMinutes = minutes > 0 ? `${minutes}m` : '';
    const formattedSeconds = seconds >= 0 ? `${seconds}s` : '';

    if (formattedMinutes && formattedSeconds) {
      return `${formattedMinutes} ${formattedSeconds}`;
    } else if (formattedMinutes) {
      return formattedMinutes;
    } else if (formattedSeconds) {
      return formattedSeconds;
    } else {
      return '0s';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-3xl">
        Loading Leaderboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-3xl">
        Error: {error}
      </div>
    );
  }
  return (
    <div
      className="flex min-h-screen bg-repeat"
      style={{ backgroundImage: `url(${backgroundImage.src})` }}>
      <div
        className="relative mx-auto rounded-xl  flex justify-center items-center w-full h-full"
        style={leaderboardContainerStyle}>
        {/* Centered Background Image with Padding */}
        <div className="absolute inset-0 z-0 flex items-center justify-center p-4">
          <div className="relative w-[75vw] h-auto">
            <Image
              src={leaderboardBg}
              alt="Pixelated Leaderboard Background"
              width={0} // Set to 0 so the width will be auto-calculated based on the container
              height={0} // Same as width, height will be calculated by aspect ratio
              className="object-contain object-center w-full h-auto"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>

        {/* Foreground Leaderboard Content */}
        <div className="flex justify-center items-center w-full h-full relative z-5 pt-40">
          <div className="p-8 w-full max-w-6xl bg-transparent rounded-lg ">
            {/* Transparent background */}
            {leaderboardData.length > 0 ? (
              <div className="overflow-x-auto" style={{ maxHeight: "350px" }}>
                <table className="w-full border-collapse rounded-md">
                  <thead
                    className="sticky top-0"
                    style={{ backgroundColor: "#551b13" }}>
                    {" "}
                    <tr>
                      <th
                        className="p-4 text-[#dc9844]  text-left text-2lg"
                        style={{
                          ...textStyle,
                          backgroundColor: "transparent",
                        }}>
                        Rank
                      </th>
                      <th
                        className="p-4 text-[#dc9844] text-left text-2lg"
                        style={{
                          ...textStyle,
                          backgroundColor: "transparent",
                        }}>
                        Player Name
                      </th>
                      <th
                        className="p-4 text-[#dc9844] text-right text-2lg"
                        style={{
                          ...textStyle,
                          backgroundColor: "transparent",
                        }}>
                        High Score
                      </th>
                      <th
                        className="p-4 text-[#dc9844] text-right text-2lg"
                        style={{
                          ...textStyle,
                          backgroundColor: "transparent",
                        }}>
                        Playtime
                      </th>
                      <th
                        className="p-4 text-[#dc9844] text-right text-2lg"
                        style={{
                          ...textStyle,
                          backgroundColor: "transparent",
                        }}>
                        Total Playtime
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((user, index) => (
                      <tr key={user.userID} className={`hover:bg-[#301301]`}>
                        <td
                          className="p-4 text-lg"
                          style={{
                            ...textStyle,
                            color: "white",
                            backgroundColor: "transparent",
                          }}>
                          {index + 1}
                        </td>
                        <td
                          className="p-4 text-lg"
                          style={{
                            ...textStyle,
                            color: "white",
                            backgroundColor: "transparent",
                          }}>
                          {user.playerName}
                        </td>
                        <td
                          className="p-4 text-right text-lg"
                          style={{
                            ...textStyle,
                            color: "white",
                            backgroundColor: "transparent",
                          }}>
                          {user.highScore}
                        </td>
                        <td
                          className="p-4 text-right text-lg"
                          style={{
                            ...textStyle,
                            color: "white",
                            backgroundColor: "transparent",
                          }}>
                          {user.highScorePlaytime ? formatPlaytimeShort(user.highScorePlaytime) : "0s"}
                        </td>
                        <td
                          className="p-4 text-right text-lg"
                          style={{
                            ...textStyle,
                            color: "white",
                            backgroundColor: "transparent",
                          }}>
                          {user.totalPlaytime ? formatPlaytimeShort(user.totalPlaytime) : "0s"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p
                className="text-center text-2xl"
                style={{
                  ...textStyle,
                  color: "white",
                  backgroundColor: "transparent",
                }}>
                No leaderboard data available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;