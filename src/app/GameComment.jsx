// components/GameComment.js
import React from "react";
import { motion } from "framer-motion";

const GameComment = ({ comment }) => {
  return (
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
  );
};

export default GameComment;