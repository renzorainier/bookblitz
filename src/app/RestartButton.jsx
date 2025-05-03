// components/RestartButton.js
import React from "react";
import { motion } from "framer-motion";

const RestartButton = ({ gameOver, onRestart }) => {
  return (
    gameOver && (
      <motion.button
        onClick={onRestart}
        className="text-white font-bold text-xl  shadow-lg transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 150,
          delay: 0,
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
    )
  );
};

export default RestartButton;