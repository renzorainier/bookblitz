import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from "framer-motion";
import Image from "next/image";
import bookImages from "./BookImages";
import { auth, db } from "@/app/firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Import getDoc
import shelfImage from './Shelf.png';
import emptyImage from './empty.png';

const generateRandomArray = (size) => {
  let arr = Array.from({ length: size }, (_, i) => i + 1);
  return arr.sort(() => Math.random() - 0.5);
};

const SortingGame = ({ userData: initialUserData }) => {
  const [array, setArray] = useState(generateRandomArray(12));
  const [comment, setComment] = useState("‎");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [sorterUses, setSorterUses] = useState(0);
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [lastCorrectTime, setLastCorrectTime] = useState(null);
  const [timeStreak, setTimeStreak] = useState(0);
  const [streakTimer, setStreakTimer] = useState(0);
  const [userData, setUserData] = useState(initialUserData); // Local state for user data
  const streakProgress = useMotionValue(0);
  const spring = { type: "spring", stiffness: 100, damping: 10 };

  useEffect(() => {
    streakProgress.set((streakTimer / 3.5) * 100);
  }, [streakTimer]);

  const updateGameData = useCallback(async () => {
    if (userData && gameOver) {
      const userDocRef = doc(db, "users", userData.userID);
      try {
        // Fetch the latest user data before updating
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const latestUserData = userDocSnapshot.data();
          const updatedData = {
            totalPlaytime: (latestUserData.totalPlaytime || 0) + totalPlayTime,
            highScore: Math.max(latestUserData.highScore || 0, score),
          };
          if (score > (latestUserData.highScore || 0)) {
            updatedData.highScorePlaytime = totalPlayTime;
          }
          await updateDoc(userDocRef, updatedData);
          console.log("Game data updated successfully!");
        } else {
          console.error("User document not found for update.");
        }
      } catch (error) {
        console.error("Error updating game data:", error);
      }
    }
  }, [userData, gameOver, score, totalPlayTime]);

  useEffect(() => {
    setUserData(initialUserData); // Update local user data when prop changes
  }, [initialUserData]);

  useEffect(() => {
    if (!gameOver) {
      const playTimer = setInterval(() => {
        setTotalPlayTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(playTimer);
    }
  }, [gameOver]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setGameOver(true);
      setComment("Game Over! Try again.");
    }
  }, [timeLeft]);

  useEffect(() => {
    if (completedLevels > 0 && completedLevels % 3 === 0) {
      setSorterUses((prev) => prev + 1);
      setComment("You earned a Sorter Power-Up!");
    }
  }, [completedLevels]);

  useEffect(() => {
    let streakInterval;

    if (timeStreak > 0 && streakTimer > 0) {
      streakInterval = setInterval(() => {
        setStreakTimer((prev) => {
          const newValue = prev - 0.1;
          if (newValue <= 0) {
            setTimeStreak(0);
            setComment("💨 Streak broken!");
            clearInterval(streakInterval);
            animate(streakProgress, { to: 0, ...spring, duration: 300 });
            return 0;
          }
          streakProgress.set((newValue / 3.5) * 100);
          return newValue;
        });
      }, 100);
    } else {
      if (streakInterval) {
        clearInterval(streakInterval);
      }
      animate(streakProgress, { to: 0, ...spring, duration: 300 });
    }

    return () => {
      if (streakInterval) {
        clearInterval(streakInterval);
      }
    };
  }, [timeStreak, spring, streakProgress]);

  useEffect(() => {
    if (gameOver) {
      updateGameData();
    }
  }, [gameOver, updateGameData]);

  const checkSorted = (arr) =>
    arr.every((val, i, a) => i === 0 || a[i - 1] <= val);

  const moveElementLeft = () => {
    if (gameOver || selectedIndex === null || selectedIndex === 0) return;

    let newArray = [...array];
    if (newArray[selectedIndex] < newArray[selectedIndex - 1]) {
      [newArray[selectedIndex], newArray[selectedIndex - 1]] = [
        newArray[selectedIndex - 1],
        newArray[selectedIndex],
      ];
      setArray(newArray);

      const newSelectedIndex = selectedIndex - 1;
      setSelectedIndex(newSelectedIndex);

      const currentTime = Date.now();
      const isWithinStreakWindow = lastCorrectTime && currentTime - lastCorrectTime <= 3500;

      if (newArray[newSelectedIndex] === newSelectedIndex + 1) {
        let pointsToAdd = 10;
        let streakBonus = 0;

        if (isWithinStreakWindow && timeStreak > 0) {
          setTimeStreak((prev) => prev + 1);
          setStreakTimer(3.5); // Reset the timer
          streakBonus = Math.min(10 + (timeStreak + 1) * 5, 50);
          pointsToAdd += streakBonus;
          setComment(`🔥 Streak +${streakBonus}! Book ${newArray[newSelectedIndex]} placed correctly!`);
        } else {
          setTimeStreak(1);
          setStreakTimer(3.5);
          setComment(`✅ Book ${newArray[newSelectedIndex]} placed correctly! 🔥 Streak started!`);
        }
        setLastCorrectTime(currentTime);
        setScore((prev) => prev + pointsToAdd);
      } else {
        setComment(`↔️ Moved Book ${newArray[newSelectedIndex]} left`);
        // Do NOT break the streak here
      }

      if (checkSorted(newArray)) {
        setComment("🎉 Sorted! Next round incoming...");
        setTimeLeft((prev) => Math.min(prev + 15, 60));
        setArray(generateRandomArray(12));
        setCompletedLevels((prev) => prev + 1);
        setTimeStreak(0); // Reset streak on level completion
        setStreakTimer(0);
        setLastCorrectTime(null);
      }
    } else {
      setComment("❌ Invalid move! Only move smaller books left.");
      setTimeLeft((prev) => Math.max(prev - 3, 0));
    }
  };

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!gameOver && event.key === "ArrowLeft") {
        moveElementLeft();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, selectedIndex, array, lastCorrectTime, timeStreak]);

  const useSorterPowerUp = () => {
    if (gameOver || sorterUses <= 0) {
      setComment(gameOver ? "Game Over!" : "⚠️ No Sorters left!");
      return;
    }

    insertionSort();
    setSorterUses((prev) => prev - 1);
    setComment("🧠 Sorter used! Bonus time + score!");
  };

  const insertionSort = () => {
    let newArray = [...array];
    for (let i = 1; i < newArray.length; i++) {
      let key = newArray[i];
      let j = i - 1;
      while (j >= 0 && newArray[j] > key) {
        newArray[j + 1] = newArray[j];
        j--;
      }
      newArray[j + 1] = key;
    }
    setArray(newArray);
    setComment("✨ Insertion Sort activated!");
    setTimeLeft((prev) => Math.min(prev + 5, 60));
    setScore((prev) => prev + 10);
    setTimeout(() => setArray(generateRandomArray(12)), 1000);
  };

  const restartGame = () => {
    setArray(generateRandomArray(12));
    setComment("");
    setSelectedIndex(null);
    setTimeLeft(60);
    setGameOver(false);
    setScore(0);
    setSorterUses(0);
    setTotalPlayTime(0);
    setCompletedLevels(0);
    setTimeStreak(0);
    setLastCorrectTime(null);
    setStreakTimer(0);
    streakProgress.set(0);
  };

  const progressPercentage = (timeLeft / 60) * 100;

  return (
<div className="flex min-h-screen bg-[#702D2B]">
      {/* Left side - 75% width */}

      {timeStreak > 0 && (
        <motion.div
          className="fixed top-12 left-4 bg-orange-700 text-white rounded-xl shadow-lg p-6 z-20 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
        >
          <div className="text-2xl font-bold mb-2">🔥 Streak!</div>
          <div className="text-xl mb-2">Count: {timeStreak}</div>
          <div className="text-sm mb-2">Time Left: {streakTimer.toFixed(1)}s</div> {/* Display the timer */}
          <div className="w-24 bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-yellow-400 h-3 rounded-full"
              style={{ width: streakProgress }}
            />
          </div>
        </motion.div>
      )}
      <div className="w-3/4 p-6">
        {/* Time Progress Bar */}
        <div className="mb-5">
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div
          className="mt-6 text-center text-xl font-semibold text-red-500"
          style={{ minHeight: '24px' }} // Adjust '24px' based on your font size and line height
        >
          {comment}
        </div>
        {/* Game Area */}
        <div className="relative flex justify-center items-end mt-10 mx-auto px-4">
        <div className="relative w-[1400px] h-[700px]">
            <Image
              src={shelfImage}
              alt="Bookshelf"
              fill
              className="object-contain"
              priority
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute inset-0 flex justify-center items-end">
              <AnimatePresence>
                {array.map((value, index) => (
                  <motion.div
                    key={value}
                    layoutId={`book-${value}`}
                    animate={{ x: index * 1 - 5, y: -320 }}
                    transition={{ type: "spring", stiffness: 150, damping: 15 }}
                    className={`flex flex-col items-center cursor-pointer z-10 ${
                      gameOver ? "cursor-default" : ""
                    }`}
                    onClick={() => !gameOver && setSelectedIndex(index)}
                  >
                    <Image
                      src={bookImages[value]}
                      alt={`Book ${value}`}
                      width={60}  // Increased width
                      height={264} // Increased height
                      className={`shadow-md object-contain transition-all duration-200 ${
                        selectedIndex === index
                          ? "border border-yellow-900"
                          : "border border-gray-300"
                      }`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* Floating Buttons */}
        <div className="fixed bottom-8 left-4 z-20 flex flex-col gap-4">
          {sorterUses > 0 && (
            <motion.button
              onClick={useSorterPowerUp}
              className={`bg-green-600 text-white p-3 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 ${
                gameOver ? "cursor-default opacity-50" : ""
              }`}
              disabled={gameOver}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", damping: 15, stiffness: 150, delay: 0.2 }}
            >
              ⚡ Use Sorter ({sorterUses})
            </motion.button>
          )}
          {gameOver && (
            <motion.button
              onClick={restartGame}
              className="bg-red-600 text-white p-4 rounded-xl shadow-lg text-xl hover:bg-red-700 transition-all duration-300"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", damping: 15, stiffness: 150, delay: sorterUses > 0 ? 0.4 : 0.2 }}
            >
              Restart Game
            </motion.button>
          )}
        </div>
      </div>

      {/* Right side - 25% width */}
      <div className="w-1/4 p-4  ">
        {/* Scoreboard */}
        <div className="grid grid-cols-1 gap-4 text-center">
          {[
            { label: 'Time Left', value: `${timeLeft}s`, imageAlt: 'Time Background' },
            { label: 'Score', value: score, imageAlt: 'Score Background' },
            { label: 'Sorters', value: sorterUses, imageAlt: 'Sorter Background' },
            { label: 'Play Time', value: `${totalPlayTime}s`, imageAlt: 'Play Time Background' },
          ].map(({ label, value, imageAlt }) => (
            <div className="relative  overflow-hidden " key={label}>
              <div className="relative w-full h-auto flex justify-center items-center">
                <Image
                  src={emptyImage}
                  alt={imageAlt}
                  layout="intrinsic"
                  className="object-cover"
                  style={{ imageRendering: 'pixelated' }}
                  width={200} // Increased width
                  height={100} // Increased height
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center z-10 p-4 text-white font-bold text-lg">
                  <div className="text-center">{label}</div>
                  <div className="text-center text-xl mt-1">{value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortingGam