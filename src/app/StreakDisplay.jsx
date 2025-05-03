// components/StreakDisplay.js
import React from "react";
import { motion } from "framer-motion";

const StreakDisplay = ({ timeStreak, streakTimer, streakProgress }) => {
  return (
    timeStreak > 0 && (
      <motion.div
        className="fixed top-12 left-4 bg-orange-700 text-white rounded-xl shadow-lg p-6 z-20 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", damping: 15, stiffness: 150 }}>
        <div className="text-2xl font-bold mb-2">🔥 Streak!</div>
        <div className="text-xl mb-2">Count: {timeStreak}</div>
        <div className="text-sm mb-2">Time Left: {streakTimer.toFixed(1)}s</div>{" "}
        {/* Display the timer */}
        <div className="w-24 bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-yellow-400 h-3 rounded-full"
            style={{ width: streakProgress }}
          />
        </div>
      </motion.div>
    )
  );
};

export default StreakDisplay;