// components/PowerUpButton.js
import React from "react";
import { motion } from "framer-motion";

const PowerUpButton = ({ sorterUses, gameOver, onUseSorter }) => {
  return (
    sorterUses > 0 &&
    !gameOver && (
      <motion.button
        onClick={onUseSorter}
        className={`text-white font-bold text-lg  shadow-lg transition-all duration-200 cursor-pointer`}
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
    )
  );
};

export default PowerUpButton;