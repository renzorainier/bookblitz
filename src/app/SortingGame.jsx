import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import bookImages from "./BookImages";

const generateRandomArray = (size) => {
  let arr = Array.from({ length: size }, (_, i) => i + 1);
  return arr.sort(() => Math.random() - 0.5);
};

const SortingGame = () => {
  const [array, setArray] = useState(generateRandomArray(12));
  const [comment, setComment] = useState("");
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
    if (timeStreak > 0 && streakTimer === 0) {
      // Start the streak timer with 3 seconds
      setStreakTimer(3);
      setComment("Streak started! Move fast to keep it going!");
    } else if (streakTimer > 0) {
      // Start countdown for the streak
      const streakCountdown = setInterval(() => {
        setStreakTimer((prev) => prev - 1);
      }, 1000);

      // Reset the streak if time runs out
      if (streakTimer === 1) {
        setTimeStreak(0); // Reset streak
        setComment("Streak ended. Try again!");
      }

      return () => clearInterval(streakCountdown); // Cleanup interval when no longer needed
    }
  }, [timeStreak, streakTimer]);

  const checkSorted = (arr) =>
    arr.every((val, i, a) => i === 0 || a[i - 1] <= val);
  const moveElementLeft = () => {
    if (selectedIndex === null || selectedIndex === 0) return;

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
      if (newArray[newSelectedIndex] === newSelectedIndex + 1) {
        let pointsToAdd = 10;

        if (lastCorrectTime) {
          const timeDiff = currentTime - lastCorrectTime;

          // If the time difference is less than or equal to 3 seconds, continue the streak
          if (timeDiff <= 3000) {
            setStreakTimer(3); // Reset the streak timer to 3 seconds
            setTimeStreak((prev) => prev + 1); // Increase streak
            pointsToAdd = 20; // Award more points for maintaining streak
            setComment(
              `🔥 Time Streak! +${pointsToAdd} points for Book ${newArray[newSelectedIndex]}`
            );
          } else {
            setTimeStreak(0); // Reset streak
            setComment(
              `✅ Book ${newArray[newSelectedIndex]} placed correctly!`
            );
          }
        } else {
          setStreakTimer(3); // Start the streak timer on the first correct move
          setComment("Streak started! Move fast to keep it going!");
        }

        setScore((prev) => prev + pointsToAdd);
        setLastCorrectTime(currentTime);
      } else {
        setTimeStreak(0); // Reset streak if the move was incorrect
        setComment(`↔️ Moved Book ${newArray[newSelectedIndex]} left`);
      }

      if (checkSorted(newArray)) {
        setComment("🎉 Sorted! Next round incoming...");
        setTimeLeft((prev) => prev + 15);
        setArray(generateRandomArray(12));
        setCompletedLevels((prev) => prev + 1);
      }
    } else {
      setComment("❌ Invalid move! Only move smaller books left.");
      setTimeLeft((prev) => Math.max(prev - 3, 0));
    }
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
    setTimeLeft((prev) => prev + 5);
    setScore((prev) => prev + 10);
    setTimeout(() => setArray(generateRandomArray(12)), 1000);
  };

  const useSorterPowerUp = () => {
    if (sorterUses > 0) {
      insertionSort();
      setSorterUses((prev) => prev - 1);
      setComment("🧠 Sorter used! Bonus time + score!");
    } else {
      setComment("⚠️ No Sorters left!");
    }
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
  };

  const progressPercentage = (timeLeft / 60) * 100;
  const streakProgress = (streakTimer / 3) * 100;

  return (
    <div className="p-6 bg-gradient-to-br from-white to-slate-100 rounded-2xl shadow-2xl max-w-4xl mx-auto">
      {/* Time Progress Bar */}
      <div className="mb-5">
        <div className="w-full bg-gray-300 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-800">
        {/* 📚 Insertion Sort Challenge */}
      </h2>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
        <div className="bg-white p-4 rounded-xl shadow text-red-600 font-bold text-xl">
          ⏳ Time Left: {timeLeft}s
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-green-700 font-bold text-2xl">
          🏆 Score: {score}
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-purple-700 font-bold text-lg">
          ⚡ Sorters: {sorterUses}
        </div>
        {timeStreak > 0 && (
          <div className="bg-white p-4 rounded-xl shadow text-orange-700 font-bold text-lg col-span-2 md:col-span-1">
            🔥 Streak: {timeStreak}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${streakProgress}%` }}></div>
            </div>
          </div>
        )}
        <div className="bg-white p-4 rounded-xl shadow text-blue-700 font-bold text-lg col-span-2 md:col-span-1">
          ⌚ Play Time: {totalPlayTime}s
        </div>
      </div>

      {/* Books */}
      <div className="flex justify-center items-end mt-10 min-h-[200px] gap-2 flex-wrap">
        <AnimatePresence>
          {array.map((value, index) => (
            <motion.div
              key={value}
              layoutId={`book-${value}`}
              animate={{ x: index * 1, y: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setSelectedIndex(index)}>
              <Image
                src={bookImages[value]}
                alt={`Book ${value}`}
                className={`rounded-lg shadow-md object-contain transition-all duration-200 max-h-44 max-w-10 ${
                  selectedIndex === index
                    ? "border-2 border-yellow-400"
                    : "border border-gray-300"
                }`}
              />
              {/* <span className="mt-1 text-sm font-semibold text-gray-700">
                {value}
              </span> */}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={moveElementLeft}
          className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200">
          🔄 Move Left
        </button>
        <button
          onClick={useSorterPowerUp}
          className="bg-green-600 text-white p-3 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200">
          ⚡ Use Sorter
        </button>
      </div>

      {/* Comments */}
      <div className="mt-6 text-center text-xl font-semibold text-red-500">
        {comment}
      </div>

      {/* Restart Game */}
      {gameOver && (
        <div className="mt-10 text-center">
          <button
            onClick={restartGame}
            className="bg-red-600 text-white p-4 rounded-xl shadow-lg text-xl hover:bg-red-700 transition-all duration-300">
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
};

export default SortingGame;

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import bookImages from "./BookImages";

// const generateRandomArray = (size) => {
//   let arr = Array.from({ length: size }, (_, i) => i + 1);
//   return arr.sort(() => Math.random() - 0.5);
// };

// const SortingGame = () => {
//   const [array, setArray] = useState(generateRandomArray(12));
//   const [comment, setComment] = useState("");
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [gameOver, setGameOver] = useState(false);
//   const [score, setScore] = useState(0);
//   const [sorterUses, setSorterUses] = useState(0);
//   const [totalPlayTime, setTotalPlayTime] = useState(0);
//   const [completedLevels, setCompletedLevels] = useState(0); // Track completed levels

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

//   // Award Sorter Power-Up after every 3 levels completed
//   useEffect(() => {
//     if (completedLevels > 0 && completedLevels % 3 === 0) {
//       setSorterUses((prev) => prev + 1);
//       setComment("You earned a Sorter Power-Up!");
//     }
//   }, [completedLevels]);

//   const checkSorted = (arr) =>
//     arr.every((val, i, a) => i === 0 || a[i - 1] <= val);

//   const moveElementLeft = () => {
//     if (selectedIndex === null || selectedIndex === 0) return;

//     let newArray = [...array];
//     if (newArray[selectedIndex] < newArray[selectedIndex - 1]) {
//       [newArray[selectedIndex], newArray[selectedIndex - 1]] = [
//         newArray[selectedIndex - 1],
//         newArray[selectedIndex],
//       ];
//       setArray(newArray);

//       const newSelectedIndex = selectedIndex - 1;
//       setSelectedIndex(newSelectedIndex);

//       if (newArray[newSelectedIndex] === newSelectedIndex + 1) {
//         setScore((prev) => prev + 10);
//         setComment(
//           `Great! Book ${newArray[newSelectedIndex]} is correctly placed.`
//         );
//       } else {
//         setComment(`Moved ${newArray[newSelectedIndex]} left!`);
//       }

//       if (checkSorted(newArray)) {
//         setComment("Congratulations! The array is sorted!");
//         setTimeLeft((prev) => prev + 15);
//         setArray(generateRandomArray(12));

//         // Increment completed levels and check for power-up
//         setCompletedLevels((prev) => prev + 1);
//       }
//     } else {
//       setComment("Invalid move! You can only move smaller elements left.");
//       setTimeLeft((prev) => Math.max(prev - 3, 0));
//     }
//   };

//   const insertionSort = () => {
//     let newArray = [...array];
//     let n = newArray.length;
//     for (let i = 1; i < n; i++) {
//       let key = newArray[i];
//       let j = i - 1;
//       while (j >= 0 && newArray[j] > key) {
//         newArray[j + 1] = newArray[j];
//         j--;
//       }
//       newArray[j + 1] = key;
//     }
//     setArray(newArray);
//     setComment("Array sorted using Insertion Sort!");
//     setTimeLeft((prev) => prev + 5);
//     setScore((prev) => prev + 10);

//     setTimeout(() => {
//       setArray(generateRandomArray(12)); // Start new round after 1 sec delay
//     }, 1000);
//   };

//   const useSorterPowerUp = () => {
//     if (sorterUses > 0) {
//       insertionSort();
//       setSorterUses((prev) => prev - 1);
//       setComment("Used a Sorter Power-Up! Array sorted.");
//       setTimeLeft((prev) => prev + 5);
//       setScore((prev) => prev + 10);
//     } else {
//       setComment("No Sorter Power-Ups left!");
//     }
//   };

//   const restartGame = () => {
//     setArray(generateRandomArray(12));
//     setComment("");
//     setSelectedIndex(null);
//     setTimeLeft(60);
//     setGameOver(false);
//     setScore(0);
//     setSorterUses(0);
//     setTotalPlayTime(0);
//     setCompletedLevels(0); // Reset completed levels when restarting
//   };

//   return (
//     <div className="p-6 bg-gray-100 rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-4 text-gray-800">
//         Insertion Sort Game
//       </h2>
//       <div className="text-lg font-semibold text-gray-700">
//         Total Play Time: {totalPlayTime}s
//       </div>

//       <div className="text-lg font-semibold texFt-red-600">
//         Time Left: {timeLeft}s
//       </div>
//       <div className="text-lg font-semibold text-green-600">Score: {score}</div>
//       <div className="text-lg font-semibold text-purple-600">
//         Sorter Power-Ups: {sorterUses}
//       </div>
//       <div className="flex mt-20 items-end h-48 relative">
//         <AnimatePresence>
//           {array.map((value, index) => (
//             <motion.div
//               key={value}
//               layoutId={`book-${value}`}
//               animate={{ x: index * 1, y: 0 }}
//               transition={{ type: "spring", stiffness: 150, damping: 15 }}
//               className="flex flex-col items-center cursor-pointer"
//               onClick={() => setSelectedIndex(index)}>
//               <Image
//                 src={bookImages[value]}
//                 alt={`Book ${value}`}
//                 className={`rounded-md shadow-md object-contain transition-all duration-200 max-h-44 max-w-10 ${
//                   selectedIndex === index
//                     ? "border-2 border-yellow-400"
//                     : "border border-gray-300"
//                 }`}
//               />
//               <span className="mt-1 text-sm font-semibold text-gray-700">
//                 {value}
//               </span>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>
//       <div className="mt-6 flex justify-center space-x-4">
//         {!gameOver ? (
//           <>
//             <motion.button
//               whileTap={{ scale: 0.9 }}
//               whileHover={{ scale: 1.05 }}
//               onClick={moveElementLeft}
//               className="px-6 py-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 transition-all duration-300">
//               ← Move Left
//             </motion.button>
//             <motion.button
//               whileTap={{ scale: 0.9 }}
//               whileHover={{ scale: 1.05 }}
//               onClick={useSorterPowerUp}
//               className="px-6 py-2 bg-purple-500 text-white rounded shadow-md hover:bg-purple-600 transition-all duration-300">
//               Use Sorter ({sorterUses})
//             </motion.button>
//           </>
//         ) : (
//           <motion.button
//             whileTap={{ scale: 0.9 }}
//             whileHover={{ scale: 1.05 }}
//             onClick={restartGame}
//             className="px-6 py-2 bg-red-500 text-white rounded shadow-md hover:bg-red-600 transition-all duration-300">
//             Restart Game
//           </motion.button>
//         )}
//       </div>
//       <div className="mt-4 text-blue-600 text-sm font-medium h-6">
//         {comment}
//       </div>
//     </div>
//   );
// };

// export default SortingGame;
