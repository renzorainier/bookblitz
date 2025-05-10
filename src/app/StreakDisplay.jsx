// components/StreakDisplay.js
import React from "react";
import { motion, AnimatePresence, useMotionTemplate } from "framer-motion";

const StreakDisplay = ({ streakTimer, streakProgress }) => {
  const progressWidth = useMotionTemplate`${streakProgress}%`;

  return (
    <AnimatePresence>
      {streakTimer > 0 && (
        <motion.div
          className="fixed top-12 left-[25%] transform -translate-x-1/2 flex justify-center items-center bg-gradient-to-r rounded-xl px-6 py-3 z-20 w-[90%] max-w-md"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{
            imageRendering: "pixelated", // Apply pixelated effect
          }}
        >
          <div className="w-full bg-gray-300 rounded-full h-5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-red-500 h-5 rounded-full"
              style={{
                width: progressWidth,
                imageRendering: "pixelated", // Apply pixelated effect to the progress bar too
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakDisplay;
