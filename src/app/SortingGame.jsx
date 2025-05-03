import { useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import Image from "next/image";
import bookImages from "./BookImages";
import { auth, db } from "@/app/firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Import getDoc
import shelfImage from "./Shelf.png";
import emptyImage from "./empty.png";
import backgroundImage from "./back.png";
import Arrow from "./Arrow.gif";
// Import your lamp images
import lampOnImage from "./lamp_on.png"; // Replace with the actual path
import lampOffImage from "./lamp_off.png"; // Replace with the actual path

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
  const spring = useMemo(() => ({ type: "spring", stiffness: 100, damping: 10 }), []);
  const [isLevelCompleteAnimating, setIsLevelCompleteAnimating] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const scoreMotionValue = useMotionValue(score); // Motion value for score animation
  const bookMotionValues = useMemo(() => array.map(() => useMotionValue(0)), [array]);
  const [invalidMove, setInvalidMove] = useState(false);
  const [isLampOn, setIsLampOn] = useState(true); // Default to true
  const [lampIntensity, setLampIntensity] = useState(0); // For dimming effect
  const [blinksThisLevel, setBlinksThisLevel] = useState(0);

  const restartGame = () => {
    setArray(generateRandomArray(12));
    setComment("‎");
    setSelectedIndex(null);
    setTimeLeft(60);
    setGameOver(false);
    setScore(0);
    setSorterUses(Math.floor(completedLevels / 3)); // Optionally reset sorter uses based on levels
    setTotalPlayTime(0);
    setCompletedLevels(0);
    setLastCorrectTime(null);
    setTimeStreak(0);
    setStreakTimer(0);
    setIsLevelCompleteAnimating(false);
    setIsLevelComplete(false);
    bookMotionValues.forEach((mv) => mv.set(0)); // Reset book shake
    setInvalidMove(false);
    setIsLampOn(true); // Default to true on restart
    setLampIntensity(0);
    setBlinksThisLevel(0);
  };

  useEffect(() => {
    if (isLevelCompleteAnimating === false && isLevelComplete === true) {
      setArray(generateRandomArray(12));
      setIsLevelComplete(false);
      setComment("‎"); // Clear the level complete message
      bookMotionValues.forEach((mv) => mv.set(0)); // Reset book shake
      setInvalidMove(false);
      setBlinksThisLevel(0); // Reset blink count for the new level
    }
  }, [isLevelCompleteAnimating, isLevelComplete, bookMotionValues]);

  useEffect(() => {
    streakProgress.set((streakTimer / 2) * 100);
  }, [streakTimer, streakProgress]);

  useEffect(() => {
    animate(scoreMotionValue, {
      to: score,
      config: { duration: 0.2 }, // Adjust duration as needed
    });
  }, [score, scoreMotionValue]);

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
            setComment("Streak broken!");
            clearInterval(streakInterval);
            animate(streakProgress, { to: 0, ...spring, duration: 300 });
            return 0;
          }
          streakProgress.set((newValue / 2) * 100); // Updated calculation
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
  }, [timeStreak, spring, streakProgress, streakTimer]);

  useEffect(() => {
    if (gameOver) {
      updateGameData();
    }
  }, [gameOver, updateGameData]);

  const checkSorted = useCallback(
    (arr) => arr.every((val, i, a) => i === 0 || a[i - 1] <= val),
    []
  );

  const moveElementLeft = useCallback(() => {
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
      const isWithinStreakWindow =
        lastCorrectTime && currentTime - lastCorrectTime <= 3500;

      if (newArray[newSelectedIndex] === newSelectedIndex + 1) {
        let pointsToAdd = 10;
        let streakBonus = 0;

        if (isWithinStreakWindow && timeStreak > 0) {
          setTimeStreak((prev) => prev + 1);
          setStreakTimer(2);
          streakBonus = Math.min(10 + (timeStreak + 1) * 5, 50);
          pointsToAdd += streakBonus;
          setComment(
            `Streak +${streakBonus}! Book ${newArray[newSelectedIndex]} placed correctly!`
          );
        } else {
          setTimeStreak(1);
          setStreakTimer(2);
          setComment(
            ` Book ${newArray[newSelectedIndex]} placed correctly! Streak started!`
          );
        }
        setLastCorrectTime(currentTime);
        setScore((prev) => prev + pointsToAdd);
      } else {
        setComment(`Moved Book ${newArray[newSelectedIndex]} left`);
        // Do NOT break the streak here
      }
      if (checkSorted(newArray)) {
        setComment("🎉 Sorted! Level complete!"); // Update comment
        setTimeLeft((prev) => Math.min(prev + 15, 60));
        setIsLevelCompleteAnimating(true); // Trigger the animation
        setIsLevelComplete(true); // Indicate level is complete
        setCompletedLevels((prev) => prev + 1);
        setTimeStreak(0);
        setStreakTimer(0); // Corrected line
        setLastCorrectTime(null);
        setSelectedIndex(null);
        setInvalidMove(false);
        setTimeout(() => setIsLevelCompleteAnimating(false), 1000); // Adjust the delay as needed
      }
    } else {
      setComment("Invalid move! Only move smaller books left.");
      setTimeLeft((prev) => Math.max(prev - 3, 0));
      setInvalidMove(true); // Set the invalid move state
    }
  }, [
    gameOver,
    selectedIndex,
    array,
    lastCorrectTime,
    timeStreak,
    setArray,
    setSelectedIndex,
    setTimeLeft,
    setScore,
    setComment,
    checkSorted,
    setIsLevelCompleteAnimating,
    setIsLevelComplete,
    setCompletedLevels,
    setTimeStreak,
    setStreakTimer,
    setLastCorrectTime,
    setInvalidMove,
  ]);

  // Trigger the shake animation when invalidMove is true and selectedIndex is valid
  useEffect(() => {
    if (
      invalidMove &&
      selectedIndex !== null &&
      bookMotionValues[selectedIndex]
    ) {
      animate(bookMotionValues[selectedIndex], [0, -10, 10, -10, 10, 0], {
        duration: 0.2,
      }).then(() => setInvalidMove(false)); // Reset invalidMove after animation
    }
  }, [invalidMove, selectedIndex, bookMotionValues]);

  // Lamp Randomness Logic (Revised)
  useEffect(() => {
    if (!gameOver) {
      const maxBlinksPerLevel = 5;

      const calculateBlinkChance = () => {
        // Chance increases with level, capped at a reasonable value
        return Math.min(0.02 + completedLevels * 0.001, 0.3); // Starts at 2%, increases by 0.1% per level, max 30%
      };

      const calculateOffDuration = () => {
        // Duration increases with level, but stays within a playable range
        return Math.min(500 + completedLevels * 20, 3000); // Starts at 0.5s, increases by 20ms per level, max 3s
      };

      const blinkLamp = () => {
        setIsLampOn(false);
        setLampIntensity(0.8);
        const offDuration = calculateOffDuration();
        setTimeout(() => {
          setIsLampOn(true);
          setLampIntensity(0);
        }, offDuration);
      };

      const gameTick = () => {
        if (blinksThisLevel < maxBlinksPerLevel) {
          const blinkChance = calculateBlinkChance();
          if (Math.random() < blinkChance) {
            blinkLamp();
            setBlinksThisLevel((prev) => prev + 1);
          }
        }
      };

      const intervalId = setInterval(gameTick, 1000); // Check for blink every second

      return () => clearInterval(intervalId);
    } else {
      setIsLampOn(true);
      setLampIntensity(0);
    }
  }, [gameOver, completedLevels, blinksThisLevel]);

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
  }, [gameOver, moveElementLeft]);

  const useSorterPowerUp = () => {
    if (gameOver || sorterUses <= 0) {
      setComment(gameOver ? "Game Over!" : "No Sorters left!");
      return;
    }

    insertionSort();
    setSorterUses((prev) => prev - 1);
    setComment("Sorter used! Bonus time + score!");
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
    setComment("Insertion Sort activated!");
    setTimeLeft((prev) => Math.min(prev + 5, 60));
    setScore((prev) => prev + 10);

    // Check if the array is now sorted and trigger level completion
    if (checkSorted(newArray)) {
      setComment("🎉 Sorted! Level complete! (Sorter)"); // Update comment to indicate sorter use
      setTimeLeft((prev) => Math.min(prev + 15, 60));
      setIsLevelCompleteAnimating(true); // Trigger the animation
      setIsLevelComplete(true); // Indicate level is complete
      setCompletedLevels((prev) => prev + 1);
      setTimeStreak(0);
      setStreakTimer(0);
      setLastCorrectTime(null);
      setSelectedIndex(null);
      setInvalidMove(false);
      setTimeout(() => setIsLevelCompleteAnimating(false), 1000); // Adjust delay as needed
      bookMotionValues.forEach((mv) => mv.set(0)); // Reset book shake
    } else {
      // If for some reason the sorter doesn't fully sort (shouldn't happen with insertion sort)
      setTimeout(() => setArray(generateRandomArray(12)), 1000);
      bookMotionValues.forEach((mv) => mv.set(0)); // Reset book shake
      setInvalidMove(false);
    }
  };
  const progressPercentage = (timeLeft / 60) * 100;
  return (
    <div
      className="flex min-h-screen bg-repeat relative " // Make container relative for absolute positioning of dimmer
      style={{ backgroundImage: `url(${backgroundImage.src})` }}>
      {/* Screen Dimmer */}
      <motion.div
        className="absolute inset-0 bg-black z-40 pointer-events-none"
        style={{ opacity: lampIntensity, transition: "opacity 0.3s ease-in-out" }}
      />
      {timeStreak > 0 && (
        <motion.div
          className="fixed top-12 left-4 bg-orange-700 text-white rounded-xl shadow-lg p-6 z-20 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}>
          <div className="text-2xl font-bold mb-2">🔥 Streak!</div>
          <div className="text-xl mb-2">Count: {timeStreak}</div>
          <div className="text-sm mb-2">
            Time Left: {streakTimer.toFixed(1)}s
          </div>{" "}
          {/* Display the timer */}
          <div className="w-24 bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-yellow-400 h-3 rounded-full"
              style={{ width: streakProgress }}
            />
          </div>
        </motion.div>
      )}
      <div className="w-3/4 p-6 relative z-30">
        {" "}
        <div className="absolute -top-10 -left-20 z-40 pointer-events-none">
          <Image
            src={isLampOn ? lampOnImage : lampOffImage}
            alt="Left Lamp"
            width={500} // Increased width
            height={180} // Increased height
            style={{ imageRendering: "pixelated" }}
          />
        </div>
        <div className="absolute -top-10 -right-20 z-40 pointer-events-none">
          <Image
            src={isLampOn ? lampOnImage : lampOffImage}
            alt="Right Lamp"
            width={500} // Increased width
            height={180} // Increased height
            style={{ imageRendering: "pixelated" }}
          />
        </div>
        {/* Time Progress Bar */}
        <div className="flex justify-center mb-3">
          <div className="w-1/2 bg-gray-300 rounded-full h-5">
            <div
              className="bg-[#E79743] h-5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-70%] text-white font-bold text-center z-30 cursor-default"
          style={{
            minHeight: "24px",
            padding: "1rem 2rem",
            fontSize: "1.3rem",
            border: "2px solid #b87729",
            boxShadow: "2px 2px 0 #b87729, 4px 4px 0 #935b1a",
            minWidth: "auto",
            backgroundColor: "#b87729", // Example background color
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
          {comment}
        </motion.div>
        {/* Game Area */}
        <div className="relative flex justify-center items-end mt-10 mx-auto px-4">
          <div className="relative w-[1400px] h-[700px]">
            <Image
              src={shelfImage}
              alt="Bookshelf"
              fill
              className="object-contain"
              priority
              style={{ imageRendering: "pixelated" }}
            />
            <div className="absolute inset-0 flex justify-center items-end">
              <AnimatePresence>
                {array.map((value, index) => (
                  <motion.div
                    key={value}
                    layoutId={`book-${value}`}
                    style={{ x: bookMotionValues[index] }} // Apply the motion value
                    animate={{
                      x: index * 1 - 5,
                      y:
                        selectedIndex === index
                          ? -335
                          : isLevelCompleteAnimating
                          ? -350 // Slightly lifted position
                          : -320,
                      rotate: selectedIndex === index ? -3 : 0,
                      scale: isLevelCompleteAnimating ? 1.05 : 1, // Subtle scale increase
                      boxShadow: isLevelCompleteAnimating
                        ? "0 5px 10px rgba(0, 0, 0, 0.2)"
                        : "0 2px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow
                    }}
                    transition={{
                      type: "spring",
                      stiffness: selectedIndex === index ? 180 : 120,
                      damping: selectedIndex === index ? 18 : 15,
                      velocity: selectedIndex === index ? 5 : 0,
                      delay: isLevelCompleteAnimating ? index * 0.05 : 0, // Staggered delay
                      duration: isLevelCompleteAnimating ? 0.3 : 0.2,
                    }}
                    className={`flex flex-col items-center cursor-pointer ${
                      gameOver ? "cursor-default" : ""
                    }`}
                    style={{ zIndex: selectedIndex === index ? 20 : 10 }}
                    onClick={() => !gameOver && setSelectedIndex(index)}>
                    {selectedIndex === index && (
                      <motion.div
                        className="absolute top-[-130px] left-[calc(50% + 30px)] -translate-x-1/2 w-24 h-24 z-20 flex justify-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}>
                        <Image
                          src={Arrow}
                          alt="Selector"
                          width={96}
                          height={96}
                          style={{ imageRendering: "pixelated" }}
                        />
                      </motion.div>
                    )}
                    <Image
                      src={bookImages[value]}
                      alt={`Book ${value}`}
                      width={60}
                      height={100}
                      className={`shadow-md object-contain transition-all duration-200 border-2 ${
                        selectedIndex === index
                          ? "border-yellow-500"
                          : "border-gray-900"
                      }`}
                      style={{ imageRendering: "pixelated" }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* Floating Buttons (positioned like comment) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-200%] z-50 flex flex-col gap-4 items-center justify-center">
          {sorterUses > 0 && !gameOver && (
            <motion.button
              onClick={useSorterPowerUp}
              className={`text-white font-bold text-lg  shadow-lg transition-all duration-200 cursor-pointer`}
              disabled={gameOver}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 150,
                delay: gameOver ? 0.2 : 0,
              }}
              style={{
                padding: "0.75rem 1.5rem",
                border: "2px solid #5cb85c", // Green border
                boxShadow: "2px 2px 0 #5cb85c, 4px 4px 0 #4cae4c",
                backgroundColor: "#5cb85c", // Green background
                minWidth: "160px",
                textAlign: "center",
                imageRendering: "pixelated",
              }}>
              Use Sorter ({sorterUses})
            </motion.button>
          )}
          {gameOver && (
            <motion.button
              onClick={restartGame}
              className="text-white font-bold text-xl  shadow-lg transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 150,
                delay: sorterUses > 0 ? 0.2 : 0,
              }}
              style={{
                padding: "1rem 2rem",
                border: "2px solid #d9534f", // Red border
                boxShadow: "2px 2px 0 #d9534f, 4px 4px 0 #c9302c",
                backgroundColor: "#d9534f", // Red background
                minWidth: "180px",
                textAlign: "center",
                imageRendering: "pixelated",
              }}>
              Restart Game
            </motion.button>
          )}
        </div>
      </div>
      {/* Right side - 25% width */}
      <div className="w-1/4 p-4 flex items-center justify-center z-30">
        {/* Scoreboard */}
        <div className="grid grid-cols-1 gap-6 text-center">
          {[
            {
              label: "Time Left",
              value: `${timeLeft}s`,
              imageAlt: "Time Background",
            },
            { label: "Score", value: score, imageAlt: "Score Background" },
            {
              label: "Play Time",
              value: `${totalPlayTime}s`,
              imageAlt: "Play Time Background",
            },
          ].map(({ label, value, imageAlt }) => (
            <div className="relative overflow-hidden " key={label}>
              <div className="relative w-full h-auto flex justify-center items-center">
                <Image
                  src={emptyImage}
                  alt={imageAlt}
                  layout="intrinsic"
                  className="object-cover"
                  style={{ imageRendering: "pixelated" }}
                  width={260} // Increased width
                  height={120} // Increased height
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center z-10 p-4 text-white font-bold text-4xl">
                  <div className="text-center">{label}</div>
                  <div className="text-center text-4xl mt-1">{value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Image
        src={backgroundImage}
        alt="" // Decorative image, so empty alt is okay
        fill
        className="object-cover absolute inset-0 z-0"
        style={{ imageRendering: "pixelated" }}
      />{" "}
      {/* Background behind everything */}
    </div>
  );
};

export default SortingGame;

// import { useState, useEffect, useCallback } from "react";
// import {
//   motion,
//   AnimatePresence,
//   useMotionValue,
//   useSpring,
//   animate,
// } from "framer-motion";
// import Image from "next/image";
// import bookImages from "./BookImages";
// import { auth, db } from "@/app/firebase/config";
// import { doc, updateDoc, getDoc } from "firebase/firestore"; // Import getDoc
// import shelfImage from "./Shelf.png";
// import emptyImage from "./empty.png";
// import backgroundImage from "./back.png";
// import Arrow from "./Arrow.gif";
// // Import your lamp images
// import lampOnImage from "./lamp_on.png"; // Replace with the actual path
// import lampOffImage from "./lamp_off.png"; // Replace with the actual path

// const generateRandomArray = (size) => {
//   let arr = Array.from({ length: size }, (_, i) => i + 1);
//   return arr.sort(() => Math.random() - 0.5);
// };

// const SortingGame = ({ userData: initialUserData }) => {
//   const [array, setArray] = useState(generateRandomArray(12));
//   const [comment, setComment] = useState("‎");
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [gameOver, setGameOver] = useState(false);
//   const [score, setScore] = useState(0);
//   const [sorterUses, setSorterUses] = useState(0);
//   const [totalPlayTime, setTotalPlayTime] = useState(0);
//   const [completedLevels, setCompletedLevels] = useState(0);
//   const [lastCorrectTime, setLastCorrectTime] = useState(null);
//   const [timeStreak, setTimeStreak] = useState(0);
//   const [streakTimer, setStreakTimer] = useState(0);
//   const [userData, setUserData] = useState(initialUserData); // Local state for user data
//   const streakProgress = useMotionValue(0);
//   const spring = { type: "spring", stiffness: 100, damping: 10 };
//   const [isLevelCompleteAnimating, setIsLevelCompleteAnimating] =
//     useState(false);
//   const [isLevelComplete, setIsLevelComplete] = useState(false);
//   const scoreMotionValue = useMotionValue(score); // Motion value for score animation
//   const bookMotionValues = array.map(() => useMotionValue(0));
//   const [invalidMove, setInvalidMove] = useState(false);
//   const [isLampOn, setIsLampOn] = useState(true); // Default to true
//   const [lampIntensity, setLampIntensity] = useState(0); // For dimming effect
//   const [blinksThisLevel, setBlinksThisLevel] = useState(0);

//   const restartGame = () => {
//     setArray(generateRandomArray(12));
//     setComment("‎");
//     setSelectedIndex(null);
//     setTimeLeft(60);
//     setGameOver(false);
//     setScore(0);
//     setSorterUses(Math.floor(completedLevels / 3)); // Optionally reset sorter uses based on levels
//     setTotalPlayTime(0);
//     setCompletedLevels(0);
//     setLastCorrectTime(null);
//     setTimeStreak(0);
//     setStreakTimer(0);
//     setIsLevelCompleteAnimating(false);
//     setIsLevelComplete(false);
//     bookMotionValues.forEach((mv) => mv.set(0)); // Reset book shake
//     setInvalidMove(false);
//     setIsLampOn(true); // Default to true on restart
//     setLampIntensity(0);
//     setBlinksThisLevel(0);
//   };

//   useEffect(() => {
//     if (isLevelCompleteAnimating === false && isLevelComplete === true) {
//       setArray(generateRandomArray(12));
//       setIsLevelComplete(false);
//       setComment("‎"); // Clear the level complete message
//       bookMotionValues.forEach((mv) => mv.set(0)); // Reset book shake
//       setInvalidMove(false);
//       setBlinksThisLevel(0); // Reset blink count for the new level
//     }
//   }, [isLevelCompleteAnimating, isLevelComplete]);

//   useEffect(() => {
//     streakProgress.set((streakTimer / 2) * 100);
//   }, [streakTimer]);

//   useEffect(() => {
//     animate(scoreMotionValue, {
//       to: score,
//       config: { duration: 0.2 }, // Adjust duration as needed
//     });
//   }, [score]);

//   const updateGameData = useCallback(async () => {
//     if (userData && gameOver) {
//       const userDocRef = doc(db, "users", userData.userID);
//       try {
//         // Fetch the latest user data before updating
//         const userDocSnapshot = await getDoc(userDocRef);
//         if (userDocSnapshot.exists()) {
//           const latestUserData = userDocSnapshot.data();
//           const updatedData = {
//             totalPlaytime: (latestUserData.totalPlaytime || 0) + totalPlayTime,
//             highScore: Math.max(latestUserData.highScore || 0, score),
//           };
//           if (score > (latestUserData.highScore || 0)) {
//             updatedData.highScorePlaytime = totalPlayTime;
//           }
//           await updateDoc(userDocRef, updatedData);
//           console.log("Game data updated successfully!");
//         } else {
//           console.error("User document not found for update.");
//         }
//       } catch (error) {
//         console.error("Error updating game data:", error);
//       }
//     }
//   }, [userData, gameOver, score, totalPlayTime]);

//   useEffect(() => {
//     setUserData(initialUserData); // Update local user data when prop changes
//   }, [initialUserData]);

//   useEffect(() => {
//     if (!gameOver) {
//       const playTimer = setInterval(() => {
//         setTotalPlayTime((prev) => prev + 1);
//       }, 1000);
//       return () => clearInterval(playTimer);
//     }
//   }, [gameOver]);

//   useEffect(() => {
//     if (timeLeft > 0) {
//       const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//       return () => clearInterval(timer);
//     } else {
//       setGameOver(true);
//       setComment("Game Over! Try again.");
//     }
//   }, [timeLeft]);

//   useEffect(() => {
//     if (completedLevels > 0 && completedLevels % 3 === 0) {
//       setSorterUses((prev) => prev + 1);
//       setComment("You earned a Sorter Power-Up!");
//     }
//   }, [completedLevels]);

//   useEffect(() => {
//     let streakInterval;

//     if (timeStreak > 0 && streakTimer > 0) {
//       streakInterval = setInterval(() => {
//         setStreakTimer((prev) => {
//           const newValue = prev - 0.1;
//           if (newValue <= 0) {
//             setTimeStreak(0);
//             setComment("Streak broken!");
//             clearInterval(streakInterval);
//             animate(streakProgress, { to: 0, ...spring, duration: 300 });
//             return 0;
//           }
//           streakProgress.set((newValue / 2) * 100); // Updated calculation
//           return newValue;
//         });
//       }, 100);
//     } else {
//       if (streakInterval) {
//         clearInterval(streakInterval);
//       }
//       animate(streakProgress, { to: 0, ...spring, duration: 300 });
//     }

//     return () => {
//       if (streakInterval) {
//         clearInterval(streakInterval);
//       }
//     };
//   }, [timeStreak, spring, streakProgress]);

//   useEffect(() => {
//     if (gameOver) {
//       updateGameData();
//     }
//   }, [gameOver, updateGameData]);

//   const checkSorted = (arr) =>
//     arr.every((val, i, a) => i === 0 || a[i - 1] <= val);

//   const moveElementLeft = () => {
//     if (gameOver || selectedIndex === null || selectedIndex === 0) return;

//     let newArray = [...array];
//     if (newArray[selectedIndex] < newArray[selectedIndex - 1]) {
//       [newArray[selectedIndex], newArray[selectedIndex - 1]] = [
//         newArray[selectedIndex - 1],
//         newArray[selectedIndex],
//       ];
//       setArray(newArray);

//       const newSelectedIndex = selectedIndex - 1;
//       setSelectedIndex(newSelectedIndex);

//       const currentTime = Date.now();
//       const isWithinStreakWindow =
//         lastCorrectTime && currentTime - lastCorrectTime <= 3500;

//       if (newArray[newSelectedIndex] === newSelectedIndex + 1) {
//         let pointsToAdd = 10;
//         let streakBonus = 0;

//         if (isWithinStreakWindow && timeStreak > 0) {
//           setTimeStreak((prev) => prev + 1);
//           setStreakTimer(2);
//           streakBonus = Math.min(10 + (timeStreak + 1) * 5, 50);
//           pointsToAdd += streakBonus;
//           setComment(
//             `Streak +${streakBonus}! Book ${newArray[newSelectedIndex]} placed correctly!`
//           );
//         } else {
//           setTimeStreak(1);
//           setStreakTimer(2);
//           setComment(
//             ` Book ${newArray[newSelectedIndex]} placed correctly! Streak started!`
//           );
//         }
//         setLastCorrectTime(currentTime);
//         setScore((prev) => prev + pointsToAdd);
//       } else {
//         setComment(`Moved Book ${newArray[newSelectedIndex]} left`);
//         // Do NOT break the streak here
//       }
//       if (checkSorted(newArray)) {
//         setComment("🎉 Sorted! Level complete!"); // Update comment
//         setTimeLeft((prev) => Math.min(prev + 15, 60));
//         setIsLevelCompleteAnimating(true); // Trigger the animation
//         setIsLevelComplete(true); // Indicate level is complete
//         setCompletedLevels((prev) => prev + 1);
//         setTimeStreak(0);
//         setStreakTimer(0); // Corrected line
//         setLastCorrectTime(null);
//         setSelectedIndex(null);
//         setInvalidMove(false);
//         setTimeout(() => setIsLevelCompleteAnimating(false), 1000); // Adjust the delay as needed
//       }
//     } else {
//       setComment("Invalid move! Only move smaller books left.");
//       setTimeLeft((prev) => Math.max(prev - 3, 0));
//       setInvalidMove(true); // Set the invalid move state
//     }
//   };

//   // Trigger the shake animation when invalidMove is true and selectedIndex is valid
//   useEffect(() => {
//     if (
//       invalidMove &&
//       selectedIndex !== null &&
//       bookMotionValues[selectedIndex]
//     ) {
//       animate(bookMotionValues[selectedIndex], [0, -10, 10, -10, 10, 0], {
//         duration: 0.2,
//       }).then(() => setInvalidMove(false)); // Reset invalidMove after animation
//     }
//   }, [invalidMove, selectedIndex, bookMotionValues]);

//   // Lamp Randomness Logic (Revised)
//   useEffect(() => {
//     if (!gameOver) {
//       const maxBlinksPerLevel = 5;

//       const calculateBlinkChance = () => {
//         // Chance increases with level, capped at a reasonable value
//         return Math.min(0.02 + completedLevels * 0.001, 0.3); // Starts at 2%, increases by 0.1% per level, max 30%
//       };

//       const calculateOffDuration = () => {
//         // Duration increases with level, but stays within a playable range
//         return Math.min(500 + completedLevels * 20, 3000); // Starts at 0.5s, increases by 20ms per level, max 3s
//       };

//       const blinkLamp = () => {
//         setIsLampOn(false);
//         setLampIntensity(0.8);
//         const offDuration = calculateOffDuration();
//         setTimeout(() => {
//           setIsLampOn(true);
//           setLampIntensity(0);
//         }, offDuration);
//       };

//       const gameTick = () => {
//         if (blinksThisLevel < maxBlinksPerLevel) {
//           const blinkChance = calculateBlinkChance();
//           if (Math.random() < blinkChance) {
//             blinkLamp();
//             setBlinksThisLevel((prev) => prev + 1);
//           }
//         }
//       };

//       const intervalId = setInterval(gameTick, 1000); // Check for blink every second

//       return () => clearInterval(intervalId);
//     } else {
//       setIsLampOn(true);
//       setLampIntensity(0);
//     }
//   }, [gameOver, completedLevels, blinksThisLevel]);

//   // Keyboard event listener
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (!gameOver && event.key === "ArrowLeft") {
//         moveElementLeft();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [
//     gameOver,
//     selectedIndex,
//     array,
//     lastCorrectTime,
//     timeStreak,
//     moveElementLeft,
//   ]);

//   const useSorterPowerUp = () => {
//     if (gameOver || sorterUses <= 0) {
//       setComment(gameOver ? "Game Over!" : "No Sorters left!");
//       return;
//     }

//     insertionSort();
//     setSorterUses((prev) => prev - 1);
//     setComment("Sorter used! Bonus time + score!");
//   };

//   const insertionSort = () => {
//     let newArray = [...array];
//     for (let i = 1; i < newArray.length; i++) {
//       let key = newArray[i];
//       let j = i - 1;
//       while (j >= 0 && newArray[j] > key) {
//         newArray[j + 1] = newArray[j];
//         j--;
//       }
//       newArray[j + 1] = key;
//     }
//     setArray(newArray);
//     setComment("Insertion Sort activated!");
//     setTimeLeft((prev) => Math.min(prev + 5, 60));
//     setScore((prev) => prev + 10);

//     // Check if the array is now sorted and trigger level completion
//     if (checkSorted(newArray)) {
//       setComment("🎉 Sorted! Level complete! (Sorter)"); // Update comment to indicate sorter use
//       setTimeLeft((prev) => Math.min(prev + 15, 60));
//       setIsLevelCompleteAnimating(true); // Trigger the animation
//       setIsLevelComplete(true); // Indicate level is complete
//       setCompletedLevels((prev) => prev + 1);
//       setTimeStreak(0);
//       setStreakTimer(0);
//       setLastCorrectTime(null);
//       setSelectedIndex(null);
//       setInvalidMove(false);
//       setTimeout(() => setIsLevelCompleteAnimating(false), 1000); // Adjust delay as needed
//       bookMotionValues.forEach((mv) => mv.set(0)); // Reset book shake
//     } else {
//       // If for some reason the sorter doesn't fully sort (shouldn't happen with insertion sort)
//       setTimeout(() => setArray(generateRandomArray(12)), 1000);
//       bookMotionValues.forEach((mv) => mv.set(0)); // Reset book shake
//       setInvalidMove(false);
//     }
//   };
//   const progressPercentage = (timeLeft / 60) * 100;
//   return (
//     <div
//       className="flex min-h-screen bg-repeat relative " // Make container relative for absolute positioning of dimmer
//       style={{ backgroundImage: `url(${backgroundImage.src})` }}>
//       {/* Screen Dimmer */}
//       <motion.div
//         className="absolute inset-0 bg-black z-40 pointer-events-none"
//         style={{ opacity: lampIntensity, transition: "opacity 0.3s ease-in-out" }}
//       />
//       {timeStreak > 0 && (
//         <motion.div
//           className="fixed top-12 left-4 bg-orange-700 text-white rounded-xl shadow-lg p-6 z-20 flex flex-col items-center"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.8 }}
//           transition={{ type: "spring", damping: 15, stiffness: 150 }}>
//           <div className="text-2xl font-bold mb-2">🔥 Streak!</div>
//           <div className="text-xl mb-2">Count: {timeStreak}</div>
//           <div className="text-sm mb-2">
//             Time Left: {streakTimer.toFixed(1)}s
//           </div>{" "}
//           {/* Display the timer */}
//           <div className="w-24 bg-gray-200 rounded-full h-3">
//             <motion.div
//               className="bg-yellow-400 h-3 rounded-full"
//               style={{ width: streakProgress }}
//             />
//           </div>
//         </motion.div>
//       )}
//       <div className="w-3/4 p-6 relative z-30">
//         {" "}
//         <div className="absolute -top-10 -left-20 z-40 pointer-events-none">
//           <Image
//             src={isLampOn ? lampOnImage : lampOffImage}
//             alt="Left Lamp"
//             width={500} // Increased width
//             height={180} // Increased height
//             style={{ imageRendering: "pixelated" }}
//           />
//         </div>
//         <div className="absolute -top-10 -right-20 z-40 pointer-events-none">
//           <Image
//             src={isLampOn ? lampOnImage : lampOffImage}
//             alt="Right Lamp"
//             width={500} // Increased width
//             height={180} // Increased height
//             style={{ imageRendering: "pixelated" }}
//           />
//         </div>
//         {/* Time Progress Bar */}
//         <div className="flex justify-center mb-3">
//           <div className="w-1/2 bg-gray-300 rounded-full h-5">
//             <div
//               className="bg-[#E79743] h-5 rounded-full transition-all duration-500"
//               style={{ width: `${progressPercentage}%` }}></div>
//           </div>
//         </div>
//         <motion.div
//           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-70%] text-white font-bold text-center z-30 cursor-default"
//           style={{
//             minHeight: "24px",
//             padding: "1rem 2rem",
//             fontSize: "1.3rem",
//             border: "2px solid #b87729",
//             boxShadow: "2px 2px 0 #b87729, 4px 4px 0 #935b1a",
//             minWidth: "auto",
//             backgroundColor: "#b87729", // Example background color
//           }}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}>
//           {comment}
//         </motion.div>
//         {/* Game Area */}
//         <div className="relative flex justify-center items-end mt-10 mx-auto px-4">
//           <div className="relative w-[1400px] h-[700px]">
//             <Image
//               src={shelfImage}
//               alt="Bookshelf"
//               fill
//               className="object-contain"
//               priority
//               style={{ imageRendering: "pixelated" }}
//             />
//             <div className="absolute inset-0 flex justify-center items-end">
//               <AnimatePresence>
//                 {array.map((value, index) => (
//                   <motion.div
//                     key={value}
//                     layoutId={`book-${value}`}
//                     style={{ x: bookMotionValues[index] }} // Apply the motion value
//                     animate={{
//                       x: index * 1 - 5,
//                       y:
//                         selectedIndex === index
//                           ? -335
//                           : isLevelCompleteAnimating
//                           ? -350 // Slightly lifted position
//                           : -320,
//                       rotate: selectedIndex === index ? -3 : 0,
//                       scale: isLevelCompleteAnimating ? 1.05 : 1, // Subtle scale increase
//                       boxShadow: isLevelCompleteAnimating
//                         ? "0 5px 10px rgba(0, 0, 0, 0.2)"
//                         : "0 2px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow
//                     }}
//                     transition={{
//                       type: "spring",
//                       stiffness: selectedIndex === index ? 180 : 120,
//                       damping: selectedIndex === index ? 18 : 15,
//                       velocity: selectedIndex === index ? 5 : 0,
//                       delay: isLevelCompleteAnimating ? index * 0.05 : 0, // Staggered delay
//                       duration: isLevelCompleteAnimating ? 0.3 : 0.2,
//                     }}
//                     className={`flex flex-col items-center cursor-pointer ${
//                       gameOver ? "cursor-default" : ""
//                     }`}
//                     style={{ zIndex: selectedIndex === index ? 20 : 10 }}
//                     onClick={() => !gameOver && setSelectedIndex(index)}>
//                     {selectedIndex === index && (
//                       <motion.div
//                         className="absolute top-[-130px] left-[calc(50% + 30px)] -translate-x-1/2 w-24 h-24 z-20 flex justify-center"
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -20 }}
//                         transition={{ duration: 0.2 }}>
//                         <Image
//                           src={Arrow}
//                           alt="Selector"
//                           width={96}
//                           height={96}
//                           style={{ imageRendering: "pixelated" }}
//                         />
//                       </motion.div>
//                     )}
//                     <Image
//                       src={bookImages[value]}
//                       alt={`Book ${value}`}
//                       width={60}
//                       height={100}
//                       className={`shadow-md object-contain transition-all duration-200 border-2 ${
//                         selectedIndex === index
//                           ? "border-yellow-500"
//                           : "border-gray-900"
//                       }`}
//                       style={{ imageRendering: "pixelated" }}
//                     />
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           </div>
//         </div>
//         {/* Floating Buttons (positioned like comment) */}
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-200%] z-50 flex flex-col gap-4 items-center justify-center">
//           {sorterUses > 0 && !gameOver && (
//             <motion.button
//               onClick={useSorterPowerUp}
//               className={`text-white font-bold text-lg  shadow-lg transition-all duration-200 cursor-pointer`}
//               disabled={gameOver}
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               transition={{
//                 type: "spring",
//                 damping: 15,
//                 stiffness: 150,
//                 delay: gameOver ? 0.2 : 0,
//               }}
//               style={{
//                 padding: "0.75rem 1.5rem",
//                 border: "2px solid #5cb85c", // Green border
//                 boxShadow: "2px 2px 0 #5cb85c, 4px 4px 0 #4cae4c",
//                 backgroundColor: "#5cb85c", // Green background
//                 minWidth: "160px",
//                 textAlign: "center",
//                 imageRendering: "pixelated",
//               }}>
//               Use Sorter ({sorterUses})
//             </motion.button>
//           )}
//           {gameOver && (
//             <motion.button
//               onClick={restartGame}
//               className="text-white font-bold text-xl  shadow-lg transition-all duration-300 cursor-pointer"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               transition={{
//                 type: "spring",
//                 damping: 15,
//                 stiffness: 150,
//                 delay: sorterUses > 0 ? 0.2 : 0,
//               }}
//               style={{
//                 padding: "1rem 2rem",
//                 border: "2px solid #d9534f", // Red border
//                 boxShadow: "2px 2px 0 #d9534f, 4px 4px 0 #c9302c",
//                 backgroundColor: "#d9534f", // Red background
//                 minWidth: "180px",
//                 textAlign: "center",
//                 imageRendering: "pixelated",
//               }}>
//               Restart Game
//             </motion.button>
//           )}
//         </div>
//       </div>
//       {/* Right side - 25% width */}
//       <div className="w-1/4 p-4 flex items-center justify-center z-30">
//         {/* Scoreboard */}
//         <div className="grid grid-cols-1 gap-6 text-center">
//           {[
//             {
//               label: "Time Left",
//               value: `${timeLeft}s`,
//               imageAlt: "Time Background",
//             },
//             { label: "Score", value: score, imageAlt: "Score Background" },
//             {
//               label: "Play Time",
//               value: `${totalPlayTime}s`,
//               imageAlt: "Play Time Background",
//             },
//           ].map(({ label, value, imageAlt }) => (
//             <div className="relative overflow-hidden " key={label}>
//               <div className="relative w-full h-auto flex justify-center items-center">
//                 <Image
//                   src={emptyImage}
//                   alt={imageAlt}
//                   layout="intrinsic"
//                   className="object-cover"
//                   style={{ imageRendering: "pixelated" }}
//                   width={260} // Increased width
//                   height={120} // Increased height
//                 />
//                 <div className="absolute inset-0 flex flex-col justify-center items-center z-10 p-4 text-white font-bold text-4xl">
//                   <div className="text-center">{label}</div>
//                   <div className="text-center text-4xl mt-1">{value}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <img src={backgroundImage} className="absolute inset-0 z-0" />{" "}
//       {/* Background behind everything */}
//     </div>
//   );

// };

// export default SortingGame;





// import { useState, useEffect, useCallback } from "react";
// import {
//   motion,
//   AnimatePresence,
//   useMotionValue,
//   useSpring,
//   animate,
// } from "framer-motion";
// import Image from "next/image";
// import bookImages from "./BookImages";
// import { auth, db } from "@/app/firebase/config";
// import { doc, updateDoc, getDoc } from "firebase/firestore"; // Import getDoc
// import shelfImage from "./Shelf.png";
// import emptyImage from "./empty.png";
// import backgroundImage from "./back.png";
// import Arrow from "./Arrow.gif";

// const generateRandomArray = (size) => {
//   let arr = Array.from({ length: size }, (_, i) => i + 1);
//   return arr.sort(() => Math.random() - 0.5);
// };

// const SortingGame = ({ userData: initialUserData }) => {
//   const [array, setArray] = useState(generateRandomArray(12));
//   const [comment, setComment] = useState("‎");
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [gameOver, setGameOver] = useState(false);
//   const [score, setScore] = useState(0);
//   const [sorterUses, setSorterUses] = useState(0);
//   const [totalPlayTime, setTotalPlayTime] = useState(0);
//   const [completedLevels, setCompletedLevels] = useState(0);
//   const [lastCorrectTime, setLastCorrectTime] = useState(null);
//   const [timeStreak, setTimeStreak] = useState(0);
//   const [streakTimer, setStreakTimer] = useState(0);
//   const [userData, setUserData] = useState(initialUserData); // Local state for user data
//   const streakProgress = useMotionValue(0);
//   const spring = { type: "spring", stiffness: 100, damping: 10 };
//   const [isLevelCompleteAnimating, setIsLevelCompleteAnimating] =
//     useState(false);
//   const [isLevelComplete, setIsLevelComplete] = useState(false);

//   const restartGame = () => {
//     setArray(generateRandomArray(12));
//     setComment("‎");
//     setSelectedIndex(null);
//     setTimeLeft(60);
//     setGameOver(false);
//     setScore(0);
//     setSorterUses(0); // Optionally reset sorter uses based on levels
//     setTotalPlayTime(0);
//     setCompletedLevels(0);
//     setLastCorrectTime(null);
//     setTimeStreak(0);
//     setStreakTimer(0);
//     setIsLevelCompleteAnimating(false);
//     setIsLevelComplete(false);
//   };

//   useEffect(() => {
//     if (isLevelCompleteAnimating === false && isLevelComplete === true) {
//       setArray(generateRandomArray(12));
//       setIsLevelComplete(false);
//       setComment("‎"); // Clear the level complete message
//     }
//   }, [isLevelCompleteAnimating, isLevelComplete]);

//   useEffect(() => {
//     streakProgress.set((streakTimer / 2) * 100);
//   }, [streakTimer]);

//   const updateGameData = useCallback(async () => {
//     if (userData && gameOver) {
//       const userDocRef = doc(db, "users", userData.userID);
//       try {
//         // Fetch the latest user data before updating
//         const userDocSnapshot = await getDoc(userDocRef);
//         if (userDocSnapshot.exists()) {
//           const latestUserData = userDocSnapshot.data();
//           const updatedData = {
//             totalPlaytime: (latestUserData.totalPlaytime || 0) + totalPlayTime,
//             highScore: Math.max(latestUserData.highScore || 0, score),
//           };
//           if (score > (latestUserData.highScore || 0)) {
//             updatedData.highScorePlaytime = totalPlayTime;
//           }
//           await updateDoc(userDocRef, updatedData);
//           console.log("Game data updated successfully!");
//         } else {
//           console.error("User document not found for update.");
//         }
//       } catch (error) {
//         console.error("Error updating game data:", error);
//       }
//     }
//   }, [userData, gameOver, score, totalPlayTime]);

//   useEffect(() => {
//     setUserData(initialUserData); // Update local user data when prop changes
//   }, [initialUserData]);

//   useEffect(() => {
//     if (!gameOver) {
//       const playTimer = setInterval(() => {
//         setTotalPlayTime((prev) => prev + 1);
//       }, 1000);
//       return () => clearInterval(playTimer);
//     }
//   }, [gameOver]);

//   useEffect(() => {
//     if (timeLeft > 0) {
//       const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//       return () => clearInterval(timer);
//     } else {
//       setGameOver(true);
//       setComment("Game Over! Try again.");
//     }
//   }, [timeLeft]);

//   useEffect(() => {
//     if (completedLevels > 0 && completedLevels % 3 === 0) {
//       setSorterUses((prev) => prev + 1);
//       setComment("You earned a Sorter Power-Up!");
//     }
//   }, [completedLevels]);

//   useEffect(() => {
//     let streakInterval;

//     if (timeStreak > 0 && streakTimer > 0) {
//       streakInterval = setInterval(() => {
//         setStreakTimer((prev) => {
//           const newValue = prev - 0.1;
//           if (newValue <= 0) {
//             setTimeStreak(0);
//             setComment("Streak broken!");
//             clearInterval(streakInterval);
//             animate(streakProgress, { to: 0, ...spring, duration: 300 });
//             return 0;
//           }
//           streakProgress.set((newValue / 2) * 100); // Updated calculation
//           return newValue;
//         });
//       }, 100);
//     } else {
//       if (streakInterval) {
//         clearInterval(streakInterval);
//       }
//       animate(streakProgress, { to: 0, ...spring, duration: 300 });
//     }

//     return () => {
//       if (streakInterval) {
//         clearInterval(streakInterval);
//       }
//     };
//   }, [timeStreak, spring, streakProgress]);
//   useEffect(() => {
//     if (gameOver) {
//       updateGameData();
//     }
//   }, [gameOver, updateGameData]);

//   const checkSorted = (arr) =>
//     arr.every((val, i, a) => i === 0 || a[i - 1] <= val);

//   const moveElementLeft = () => {
//     if (gameOver || selectedIndex === null || selectedIndex === 0) return;

//     let newArray = [...array];
//     if (newArray[selectedIndex] < newArray[selectedIndex - 1]) {
//       [newArray[selectedIndex], newArray[selectedIndex - 1]] = [
//         newArray[selectedIndex - 1],
//         newArray[selectedIndex],
//       ];
//       setArray(newArray);

//       const newSelectedIndex = selectedIndex - 1;
//       setSelectedIndex(newSelectedIndex);

//       const currentTime = Date.now();
//       const isWithinStreakWindow =
//         lastCorrectTime && currentTime - lastCorrectTime <= 3500;

//       if (newArray[newSelectedIndex] === newSelectedIndex + 1) {
//         let pointsToAdd = 10;
//         let streakBonus = 0;

//         if (isWithinStreakWindow && timeStreak > 0) {
//           setTimeStreak((prev) => prev + 1);
//           setStreakTimer(2);
//           streakBonus = Math.min(10 + (timeStreak + 1) * 5, 50);
//           pointsToAdd += streakBonus;
//           setComment(
//             `Streak +${streakBonus}! Book ${newArray[newSelectedIndex]} placed correctly!`
//           );
//         } else {
//           setTimeStreak(1);
//           setStreakTimer(2);
//           setComment(
//             ` Book ${newArray[newSelectedIndex]} placed correctly! Streak started!`
//           );
//         }
//         setLastCorrectTime(currentTime);
//         setScore((prev) => prev + pointsToAdd);
//       } else {
//         setComment(`Moved Book ${newArray[newSelectedIndex]} left`);
//         // Do NOT break the streak here
//       }
//       if (checkSorted(newArray)) {
//         setComment("Sorted! Level complete!"); // Update comment
//         setTimeLeft((prev) => Math.min(prev + 15, 60));
//         setIsLevelCompleteAnimating(true); // Trigger the animation
//         setIsLevelComplete(true); // Indicate level is complete
//         setCompletedLevels((prev) => prev + 1);
//         setTimeStreak(0);
//         setStreakTimer(0);
//         setLastCorrectTime(null);
//         setSelectedIndex(null);
//         setTimeout(() => setIsLevelCompleteAnimating(false), 1000); // Adjust the delay as needed
//       }
//     } else {
//       setComment("Invalid move! Only move smaller books left.");
//       setTimeLeft((prev) => Math.max(prev - 3, 0));
//     }
//   };

//   // Keyboard event listener
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (!gameOver && event.key === "ArrowLeft") {
//         moveElementLeft();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [gameOver, selectedIndex, array, lastCorrectTime, timeStreak]);

//   const useSorterPowerUp = () => {
//     if (gameOver || sorterUses <= 0) {
//       setComment(gameOver ? "Game Over!" : "No Sorters left!");
//       return;
//     }

//     insertionSort();
//     setSorterUses((prev) => prev - 1);
//     setComment("Sorter used! Bonus time + score!");
//   };

//   const insertionSort = () => {
//     let newArray = [...array];
//     for (let i = 1; i < newArray.length; i++) {
//       let key = newArray[i];
//       let j = i - 1;
//       while (j >= 0 && newArray[j] > key) {
//         newArray[j + 1] = newArray[j];
//         j--;
//       }
//       newArray[j + 1] = key;
//     }
//     setArray(newArray);
//     setComment("✨ Insertion Sort activated!");
//     setTimeLeft((prev) => Math.min(prev + 5, 60));
//     setScore((prev) => prev + 10);

//     // Check if the array is now sorted and trigger level completion
//     if (checkSorted(newArray)) {
//       setComment("🎉 Sorted! Level complete! (Sorter)"); // Update comment to indicate sorter use
//       setTimeLeft((prev) => Math.min(prev + 15, 60));
//       setIsLevelCompleteAnimating(true); // Trigger the animation
//       setIsLevelComplete(true); // Indicate level is complete
//       setCompletedLevels((prev) => prev + 1);
//       setTimeStreak(0);
//       setStreakTimer(0);
//       setLastCorrectTime(null);
//       setSelectedIndex(null);
//       setTimeout(() => setIsLevelCompleteAnimating(false), 1000); // Adjust delay as needed
//     } else {
//       // If for some reason the sorter doesn't fully sort (shouldn't happen with insertion sort)
//       setTimeout(() => setArray(generateRandomArray(12)), 1000);
//     }
//   };
//   const progressPercentage = (timeLeft / 60) * 100;

//   return (
//     <div
//       className="flex min-h-screen bg-repeat"
//       style={{ backgroundImage: `url(${backgroundImage.src})` }}>
//       {timeStreak > 0 && (
//         <motion.div
//           className="fixed top-12 left-4 bg-orange-700 text-white rounded-xl shadow-lg p-6 z-20 flex flex-col items-center"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.8 }}
//           transition={{ type: "spring", damping: 15, stiffness: 150 }}>
//           <div className="text-2xl font-bold mb-2">🔥 Streak!</div>
//           <div className="text-xl mb-2">Count: {timeStreak}</div>
//           <div className="text-sm mb-2">
//             Time Left: {streakTimer.toFixed(1)}s
//           </div>{" "}
//           {/* Display the timer */}
//           <div className="w-24 bg-gray-200 rounded-full h-3">
//             <motion.div
//               className="bg-yellow-400 h-3 rounded-full"
//               style={{ width: streakProgress }}
//             />
//           </div>
//         </motion.div>
//       )}
//       <div className="w-3/4 p-6 relative">
//         {/* Time Progress Bar */}
//         <div className="flex justify-center mb-3">
//           <div className="w-1/2 bg-gray-300 rounded-full h-5">
//             <div
//               className="bg-[#E79743] h-5 rounded-full transition-all duration-500"
//               style={{ width: `${progressPercentage}%` }}></div>
//           </div>
//         </div>

//         <motion.div
//           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-70%] text-white font-bold text-center z-30 cursor-default"
//           style={{
//             minHeight: "24px",
//             padding: "1rem 2rem",
//             fontSize: "1.3rem",
//             border: "2px solid #b87729",
//             boxShadow: "2px 2px 0 #b87729, 4px 4px 0 #935b1a",
//             minWidth: "auto",
//             backgroundColor: "#b87729", // Example background color
//             // Add any other base styles you had in pixelatedButtonStyle
//           }}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}>
//           {comment}
//         </motion.div>
//         {/* Game Area */}
//         <div className="relative flex justify-center items-end mt-10 mx-auto px-4">
//           <div className="relative w-[1400px] h-[700px]">
//             <Image
//               src={shelfImage}
//               alt="Bookshelf"
//               fill
//               className="object-contain"
//               priority
//               style={{ imageRendering: "pixelated" }}
//             />
//             <div className="absolute inset-0 flex justify-center items-end">
//               <AnimatePresence>
//                 {array.map((value, index) => (
//                   <motion.div
//                     key={value}
//                     layoutId={`book-${value}`}
//                     animate={{
//                       x: index * 1 - 5,
//                       y:
//                         selectedIndex === index
//                           ? -335
//                           : isLevelCompleteAnimating
//                           ? -350 // Slightly lifted position
//                           : -320,
//                       rotate: selectedIndex === index ? -3 : 0,
//                       scale: isLevelCompleteAnimating ? 1.05 : 1, // Subtle scale increase
//                       boxShadow: isLevelCompleteAnimating
//                         ? "0 5px 10px rgba(0, 0, 0, 0.2)"
//                         : "0 2px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow
//                     }}
//                     transition={{
//                       type: "spring",
//                       stiffness: selectedIndex === index ? 180 : 120,
//                       damping: selectedIndex === index ? 18 : 15,
//                       velocity: selectedIndex === index ? 5 : 0,
//                       delay: isLevelCompleteAnimating ? index * 0.05 : 0, // Staggered delay
//                       duration: isLevelCompleteAnimating ? 0.3 : 0.2,
//                     }}
//                     className={`flex flex-col items-center cursor-pointer ${
//                       gameOver ? "cursor-default" : ""
//                     }`}
//                     style={{ zIndex: selectedIndex === index ? 20 : 10 }}
//                     onClick={() => !gameOver && setSelectedIndex(index)}>
//                     {selectedIndex === index && (
//                       <motion.div
//                         className="absolute top-[-130px] left-[calc(50% + 30px)] -translate-x-1/2 w-24 h-24 z-20 flex justify-center"
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -20 }}
//                         transition={{ duration: 0.2 }}>
//                         <Image
//                           src={Arrow}
//                           alt="Selector"
//                           width={96}
//                           height={96}
//                           style={{ imageRendering: "pixelated" }}
//                         />
//                       </motion.div>
//                     )}
//                     <Image
//                       src={bookImages[value]}
//                       alt={`Book ${value}`}
//                       width={60}
//                       height={100}
//                       className={`shadow-md object-contain transition-all duration-200 border-2 ${
//                         selectedIndex === index
//                           ? "border-yellow-500"
//                           : "border-gray-900"
//                       }`}
//                       style={{ imageRendering: "pixelated" }}
//                     />
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           </div>
//         </div>

//    {/* Floating Buttons (positioned like comment) */}
//    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-200%] z-50 flex flex-col gap-4 items-center justify-center">
//           {sorterUses > 0 && !gameOver && (
//             <motion.button
//               onClick={useSorterPowerUp}
//               className={`text-white font-bold text-lg  shadow-lg transition-all duration-200 cursor-pointer`}
//               disabled={gameOver}
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               transition={{
//                 type: "spring",
//                 damping: 15,
//                 stiffness: 150,
//                 delay: gameOver ? 0.2 : 0,
//               }}
//               style={{
//                 padding: "0.75rem 1.5rem",
//                 border: "2px solid #5cb85c", // Green border
//                 boxShadow: "2px 2px 0 #5cb85c, 4px 4px 0 #4cae4c",
//                 backgroundColor: "#5cb85c", // Green background
//                 minWidth: "160px",
//                 textAlign: "center",
//                 imageRendering: "pixelated",
//               }}>
//               Use Sorter ({sorterUses})
//             </motion.button>
//           )}
//           {gameOver && (
//             <motion.button
//               onClick={restartGame}
//               className="text-white font-bold text-xl  shadow-lg transition-all duration-300 cursor-pointer"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               transition={{
//                 type: "spring",
//                 damping: 15,
//                 stiffness: 150,
//                 delay: sorterUses > 0 ? 0.2 : 0,
//               }}
//               style={{
//                 padding: "1rem 2rem",
//                 border: "2px solid #d9534f", // Red border
//                 boxShadow: "2px 2px 0 #d9534f, 4px 4px 0 #c9302c",
//                 backgroundColor: "#d9534f", // Red background
//                 minWidth: "180px",
//                 textAlign: "center",
//                 imageRendering: "pixelated",
//               }}>
//               Restart Game
//             </motion.button>
//           )}
//         </div>
//       </div>

//       {/* Right side - 25% width */}
//       <div className="w-1/4 p-4 flex items-center justify-center">
//         {/* Scoreboard */}
//         <div className="grid grid-cols-1 gap-6 text-center">
//           {[
//             {
//               label: "Time Left",
//               value: `${timeLeft}s`,
//               imageAlt: "Time Background",
//             },
//             { label: "Score", value: score, imageAlt: "Score Background" },
//             {
//               label: "Play Time",
//               value: `${totalPlayTime}s`,
//               imageAlt: "Play Time Background",
//             },
//           ].map(({ label, value, imageAlt }) => (
//             <div className="relative  overflow-hidden " key={label}>
//               <div className="relative w-full h-auto flex justify-center items-center">
//                 <Image
//                   src={emptyImage}
//                   alt={imageAlt}
//                   layout="intrinsic"
//                   className="object-cover"
//                   style={{ imageRendering: "pixelated" }}
//                   width={260} // Increased width
//                   height={120} // Increased height
//                 />
//                 <div className="absolute inset-0 flex flex-col justify-center items-center z-10 p-4 text-white font-bold text-4xl">
//                   <div className="text-center">{label}</div>
//                   <div className="text-center text-4xl mt-1">{value}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <img src={backgroundImage} />
//     </div>
//   );
// };

// export default SortingGame;
