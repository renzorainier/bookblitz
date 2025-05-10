import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
 import { motion, useMotionValue, animate } from "framer-motion";
 import Image from "next/image";
 import backgroundImage from "./back.png";
 import { db } from "@/app/firebase/config";
 import { doc, updateDoc, getDoc } from "firebase/firestore";
 import BookShelf from "./BookShelf";
 import GameComment from "./GameComment";
 import TimeProgressBar from "./TimeProgressBar";
 import Scoreboard from "./ScoreBoard";
 import PowerUpButton from "./PowerUpButton";
 import RestartButton from "./RestartButton";
 import StreakDisplay from "./StreakDisplay";
 import Lamp from "./Lamp";
 import selectSound from './/sounds/pickup.wav'; // Import the sound effect
 import moveSound from './/sounds/swoosh.wav';
 import winSound from './/sounds/win.wav';
 import errorSound from './/sounds/error.mp3'; // Import error sound
 import lightFlickerSound from './/sounds/flicker.mp3'; // Import light flicker sound
 import sorterSound from './/sounds/sorter.mp3'; // Import sorter sound
 import gameOverSound from './/sounds/over.wav'; // Import game over sound
 // Import background music
 import backgroundMusic from './/sounds/background.mp3';

 const getRandomArray = (size) =>
   Array.from({ length: size }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

 const SortingGame = ({ userData: initialUserData }) => {
   const [array, setArray] = useState(getRandomArray(12));
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
   const [userData, setUserData] = useState(initialUserData);
   const streakProgress = useMotionValue(0);
   const spring = useMemo(() => ({ type: "spring", stiffness: 100, damping: 10 }), []);
   const [isLevelCompleteAnimating, setIsLevelCompleteAnimating] =
     useState(false);
   const [isLevelComplete, setIsLevelComplete] = useState(false);
   const scoreMotionValue = useMotionValue(score);
   const bookMotionValues = useRef([
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
     useMotionValue(0),
   ]).current;
   const [invalidMove, setInvalidMove] = useState(false);
   const [isLampOn, setIsLampOn] = useState(true);
   const [lampIntensity, setLampIntensity] = useState(0);
   const [blinksThisLevel, setBlinksThisLevel] = useState(0);
   const selectSoundRef = useRef(null);
   const moveSoundRef = useRef(null); // Ref for the move sound
   const winSoundRef = useRef(null); // Ref for the win sound
   const errorSoundRef = useRef(null); // Ref for the error sound
   const lightFlickerSoundRef = useRef(null); // Ref for the light flicker sound
   const sorterSoundRef = useRef(null); // Ref for the sorter sound
   const gameOverSoundRef = useRef(null); // Ref for the game over sound
   // Ref for the background music
   const backgroundMusicRef = useRef(null);

   useEffect(() => {
     selectSoundRef.current = new Audio(selectSound);
     moveSoundRef.current = new Audio(moveSound);
     winSoundRef.current = new Audio(winSound);
     errorSoundRef.current = new Audio(errorSound);
     lightFlickerSoundRef.current = new Audio(lightFlickerSound);
     sorterSoundRef.current = new Audio(sorterSound);
     gameOverSoundRef.current = new Audio(gameOverSound);
     // Initialize background music
     backgroundMusicRef.current = new Audio(backgroundMusic);
     backgroundMusicRef.current.loop = true; // Enable looping
     backgroundMusicRef.current.volume = 0.5; // Adjust volume as needed
   }, []);

   useEffect(() => {
     // Play background music when the component mounts
     if (backgroundMusicRef.current) {
       backgroundMusicRef.current.play().catch(error => console.error("Error playing background music:", error));
     }

     // Pause background music when the component unmounts
     return () => {
       if (backgroundMusicRef.current) {
         backgroundMusicRef.current.pause();
         backgroundMusicRef.current.currentTime = 0; // Reset playback position
       }
     };
   }, []);

   const resetGame = useCallback(() => {
     setArray(getRandomArray(12));
     setComment("");
     setSelectedIndex(null);
     setTimeLeft(60);
     setGameOver(false);
     setScore(0);
     setSorterUses(0);
     setTotalPlayTime(0);
     setCompletedLevels(0);
     setLastCorrectTime(null);
     setTimeStreak(0);
     setStreakTimer(0);
     setIsLevelCompleteAnimating(false);
     setIsLevelComplete(false);
     bookMotionValues.forEach((mv) => mv.set(0));
     setInvalidMove(false);
     setIsLampOn(true);
     setLampIntensity(0);
     setBlinksThisLevel(0);
     // Restart background music on game reset
     if (backgroundMusicRef.current) {
       backgroundMusicRef.current.currentTime = 0;
       backgroundMusicRef.current.play().catch(error => console.error("Error playing background music:", error));
     }
   }, [completedLevels, bookMotionValues]);

   useEffect(() => {
     if (!isLevelCompleteAnimating && isLevelComplete) {
       setArray(getRandomArray(12));
       setIsLevelComplete(false);
       setComment("");
       bookMotionValues.forEach((mv) => mv.set(0));
       setInvalidMove(false);
       setBlinksThisLevel(0);
     }
   }, [isLevelCompleteAnimating, isLevelComplete, bookMotionValues]);

   useEffect(() => {
     streakProgress.set((streakTimer / 2) * 100);
   }, [streakTimer, streakProgress]);

   useEffect(() => {
     animate(scoreMotionValue, { to: score, config: { duration: 0.2 } });
   }, [score, scoreMotionValue]);

   const updateGameData = useCallback(async () => {
     if (userData && gameOver) {
       try {
         const userDocRef = doc(db, "users", userData.userID);
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
     setUserData(initialUserData);
   }, [initialUserData, setUserData]);

   useEffect(() => {
     if (!gameOver) {
       const playTimer = setInterval(
         () => setTotalPlayTime((prev) => prev + 1),
         1000
       );
       return () => clearInterval(playTimer);
     }
   }, [gameOver, setTotalPlayTime]);

   useEffect(() => {
     if (timeLeft > 0) {
       const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
       return () => clearInterval(timer);
     } else {
       setGameOver(true);
       setComment("Game Over! Try again.");
       if (gameOverSoundRef.current) {
         gameOverSoundRef.current.play().catch(error => console.error("Error playing game over sound:", error));
       }
       // Pause background music on game over
       if (backgroundMusicRef.current) {
         backgroundMusicRef.current.pause();
       }
     }
   }, [timeLeft, setGameOver, setComment, gameOverSoundRef, backgroundMusicRef]);

   useEffect(() => {
     if (completedLevels > 0 && completedLevels % 3 === 0) {
       setSorterUses((prev) => prev + 1);
       setComment("You earned a Sorter Power-Up!");
     }
   }, [completedLevels, setSorterUses, setComment]);
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
           streakProgress.set((newValue / 2) * 100);
           return newValue;
         });
       }, 100);
     } else {
       if (streakInterval) clearInterval(streakInterval);
       animate(streakProgress, { to: 0, ...spring, duration: 300 });
     }

     return () => {
       if (streakInterval) clearInterval(streakInterval);
     };
   }, [
     timeStreak,
     spring,
     streakProgress,
     setTimeStreak,
     setComment,
     streakTimer,
   ]);
   useEffect(() => {
     if (gameOver) updateGameData();
   }, [gameOver, updateGameData]);

   const isSorted = useCallback(
     (arr) => arr.every((val, i, a) => i === 0 || a[i - 1] <= val),
     []
   );

   const areLeftBooksCorrect = useCallback(
     (arr, index) => {
       for (let i = 0; i < index; i++) {
         if (arr[i] !== i + 1) {
           return false;
         }
       }
       return true;
     },
     []
   );

   const moveLeft = useCallback(() => {
     if (gameOver || selectedIndex === null || selectedIndex === 0) return;

     const newArray = [...array];
     const current = newArray[selectedIndex];
     const left = newArray[selectedIndex - 1];

     if (current < left) {
       [newArray[selectedIndex], newArray[selectedIndex - 1]] = [left, current];
       setArray(newArray);
       if (moveSoundRef.current) {
         moveSoundRef.current.play().catch(error => console.error("Error playing move sound:", error));
       }

       const newSelectedIndex = selectedIndex - 1;
       setSelectedIndex(newSelectedIndex);

       const currentTime = Date.now();
       const inStreakWindow =
         lastCorrectTime && currentTime - lastCorrectTime <= 3500;

       if (newArray[newSelectedIndex] === newSelectedIndex + 1) {
         const isNowCorrectlyPlaced = areLeftBooksCorrect(newArray, newSelectedIndex);
         let points = 10;
         let streakBonus = 0;

         if (inStreakWindow && timeStreak > 0) {
           setTimeStreak((prev) => prev + 1);
           setStreakTimer(2);
           streakBonus = Math.min(10 + (timeStreak + 1) * 5, 50);
           points += streakBonus;
           setComment(
             `Streak +${streakBonus}! Book ${newArray[newSelectedIndex]} placed correctly!`
           );
         } else {
           setTimeStreak(1);
           setStreakTimer(2);
           setComment(
             `Book ${newArray[newSelectedIndex]} placed correctly! Streak started!`
           );
         }
         setLastCorrectTime(currentTime);
         setScore((prev) => prev + points);

         if (isNowCorrectlyPlaced) {
           setTimeout(() => setSelectedIndex(null), 5);
         }
       } else {
         setComment(`Moved Book ${current} left`);
       }
       if (isSorted(newArray)) {
         setComment("Sorted! Level complete!");
         setTimeLeft((prev) => Math.min(prev + 15, 60));
         setIsLevelCompleteAnimating(true);
         setIsLevelComplete(true);
         setCompletedLevels((prev) => prev + 1);
         setTimeStreak(0);
         setStreakTimer(0);
         setLastCorrectTime(null);
         setSelectedIndex(null);
         setInvalidMove(false);
         setTimeout(() => setIsLevelCompleteAnimating(false), 1000);
         if (winSoundRef.current) {
           winSoundRef.current.play().catch(error => console.error("Error playing win sound:", error));
         }
       }
     } else {
       setComment("Invalid move! Only move smaller books left.");
       setTimeLeft((prev) => Math.max(prev - 3, 0));
       setInvalidMove(true);
       if (errorSoundRef.current) {
         errorSoundRef.current.play().catch(error => console.error("Error playing error sound:", error));
       }
     }
   }, [
     array,
     selectedIndex,
     gameOver,
     lastCorrectTime,
     timeStreak,
     setArray,
     setSelectedIndex,
     setLastCorrectTime,
     setScore,
     setComment,
     setTimeLeft,
     setIsLevelCompleteAnimating,
     setIsLevelComplete,
     setCompletedLevels,
     setTimeStreak,
     setStreakTimer,
     setInvalidMove,
     isSorted,
     moveSoundRef,
     winSoundRef,
     errorSoundRef,
     areLeftBooksCorrect, // Added to dependencies
   ]);

   useEffect(() => {
     if (
       invalidMove &&
       selectedIndex !== null &&
       bookMotionValues[selectedIndex]
     ) {
       animate(bookMotionValues[selectedIndex], [0, -10, 10, -10, 10, 0], {
         duration: 0.2,
       }).then(() => setInvalidMove(false));
     }
   }, [invalidMove, selectedIndex, bookMotionValues]);

   useEffect(() => {
     if (!gameOver) {
       const maxBlinks = 5;

       const blinkChance = Math.min(0.02 + completedLevels * 0.001, 0.3);
       const offDuration = Math.min(500 + completedLevels * 20, 3000);

       const blinkLamp = () => {
         setIsLampOn(false);
         setLampIntensity(0.8);
         if (lightFlickerSoundRef.current) { // Play the flicker sound
           lightFlickerSoundRef.current.currentTime = 0;
           lightFlickerSoundRef.current.play().catch(error => console.error("Error playing light flicker sound:", error));
         }
         setTimeout(() => {
           setIsLampOn(true);
           setLampIntensity(0);
         }, offDuration);
       };

       const gameTick = () => {
         if (blinksThisLevel < maxBlinks && Math.random() < blinkChance) {
           blinkLamp();
           setBlinksThisLevel((prev) => prev + 1);
         }
       };

       const intervalId = setInterval(gameTick, 1000);
       return () => clearInterval(intervalId);
     } else {
       setIsLampOn(true);
       setLampIntensity(0);
     }
   }, [
     gameOver,
     completedLevels,
     blinksThisLevel,
     setIsLampOn,
     setLampIntensity,
     lightFlickerSoundRef,
   ]);

   useEffect(() => {
     const handleKeyDown = (event) => {
       if (!gameOver && event.key === "ArrowLeft") {
         moveLeft();
       }
     };

     document.addEventListener("keydown", handleKeyDown);
     return () => document.removeEventListener("keydown", handleKeyDown);
   }, [gameOver, moveLeft]);

   const insertionSort = useCallback(() => {
     const newArray = [...array];
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
     setScore((prev) => prev + 500); // Add points for using the sorter

     if (isSorted(newArray)) {
       setComment("🎉 Sorted! Level complete! (Sorter)");
       setTimeLeft((prev) => Math.min(prev + 15, 60));
       setIsLevelCompleteAnimating(true);
       setIsLevelComplete(true);
       setCompletedLevels((prev) => prev + 1);
       setStreakTimer(0);
       setLastCorrectTime(null);
       setSelectedIndex(null);
       setInvalidMove(false);
       setTimeout(() => setIsLevelCompleteAnimating(false), 1000);
       bookMotionValues.forEach((mv) => mv.set(0));
       if (sorterSoundRef.current) {
         sorterSoundRef.current.play().catch(error => console.error("Error playing sorter sound:", error));
       }
     } else {
       setTimeout(() => setArray(getRandomArray(12)), 1000);
       bookMotionValues.forEach((mv) => mv.set(0));
       setInvalidMove(false);
       if (sorterSoundRef.current) {
         sorterSoundRef.current.play().catch(error => console.error("Error playing sorter sound:", error));
       }
     }
   }, [
     array,
     setArray,
     setComment,
     setTimeLeft,
     setScore,
     isSorted,
     setIsLevelCompleteAnimating,
     setIsLevelComplete,
     setCompletedLevels,
     setTimeStreak,
     setStreakTimer,
     setLastCorrectTime,
     setSelectedIndex,
     setInvalidMove,
     bookMotionValues,
     sorterSoundRef,
   ]);
   const useSorter = useCallback(() => {
     if (gameOver || sorterUses <= 0) {
       setComment(gameOver ? "Game Over!" : "No Sorters left!");
       return;
     }
     insertionSort();
     setSorterUses((prev) => prev - 1);
     setComment("Sorter used! Bonus time + score!");
   }, [gameOver, sorterUses, setComment, insertionSort, setSorterUses]);

   const handleBookClick = useCallback(
     (index) => {
       if (!gameOver && index !== selectedIndex) {
         setSelectedIndex(index);
         if (selectSoundRef.current) {
           selectSoundRef.current.play().catch(error => console.error("Error playing sound:", error));
         }
       }
     },
     [gameOver, setSelectedIndex, selectedIndex]
   );

   return (
     <div
       className="flex min-h-screen relative "
       style={{
         backgroundImage: `url(${backgroundImage.src})`,
         backgroundRepeat: "repeat",
         imageRendering: "pixelated",
       }}>
       <motion.div
         className="absolute inset-0 bg-black z-40 pointer-events-none"
         style={{
           opacity: lampIntensity,
           transition: "opacity 0.3s ease-in-out",
         }}
       />

       <div className="w-3/4 p-6 relative z-2">
       <StreakDisplay
         timeStreak={timeStreak}
         streakTimer={streakTimer}
         streakProgress={streakProgress}
       />
         <Lamp isOn={isLampOn} position="left" />
         <Lamp isOn={isLampOn} position="right" />
         <TimeProgressBar timeLeft={timeLeft} />
         <GameComment comment={comment} />
         <div className="relative flex justify-center items-end mt-10 mx-auto px-4">
           <BookShelf
             array={array}
             selectedIndex={selectedIndex}
             isLevelCompleteAnimating={isLevelCompleteAnimating}
             bookMotionValues={bookMotionValues}
             onBookClick={handleBookClick}
           />
         </div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-200%] z-50 flex flex-col gap-4 items-center justify-center">
           <PowerUpButton
             sorterUses={sorterUses}
             gameOver={gameOver}
             onUseSorter={useSorter}
           />
           <RestartButton gameOver={gameOver} onRestart={resetGame} />
         </div>
       </div>
       <div className="w-1/4 p-4 flex items-center justify-center z-30">
         <Scoreboard
           timeLeft={timeLeft}
           score={score}
           totalPlayTime={totalPlayTime}
         />
       </div>
       <Image
         src={backgroundImage}
         alt="Game Background"
         className="absolute inset-0 z-0 w-full h-full"
         style={{ objectFit: "contain", opacity: 0 }}
         priority
       />
     </div>
   );
 };

 export default SortingGame;