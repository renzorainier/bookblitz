import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import bookImages from "./BookImages";
import Arrow from "./Arrow.gif";

const BookItem = ({
  value,
  index,
  selectedIndex,
  isLevelCompleteAnimating,
  motionValue,
  onBookClick,
}) => {
  return (
    <motion.div
      layoutId={`book-${value}`}
      style={{
        x: motionValue,
        zIndex: selectedIndex === index ? 20 : 10,
      }}
      animate={{
        x: index * 1 - 5,
        y:
          selectedIndex === index
            ? -335
            : isLevelCompleteAnimating
            ? -350
            : -320,
        rotate: selectedIndex === index ? -3 : 0,
        scale: isLevelCompleteAnimating ? 1.05 : 1,
        boxShadow: isLevelCompleteAnimating
          ? "0 5px 10px rgba(0, 0, 0, 0.2)"
          : "0 2px 5px rgba(0, 0, 0, 0.1)",
      }}
      transition={{
        type: "spring",
        stiffness: selectedIndex === index ? 180 : 120,
        damping: selectedIndex === index ? 18 : 15,
        velocity: selectedIndex === index ? 5 : 0,
        delay: isLevelCompleteAnimating ? index * 0.05 : 0,
        duration: isLevelCompleteAnimating ? 0.3 : 0.2,
      }}
      className={`flex flex-col items-center cursor-pointer ${
        false ? "cursor-default" : ""
      }`}
      onClick={() => onBookClick(index)}
    >
   {selectedIndex === index && (
  <motion.div
    className="absolute top-[-130px] -left-[30%] -translate-x-1/2 w-24 h-24 z-20 flex justify-center"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
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
          selectedIndex === index ? "border-yellow-500" : "border-gray-900"
        }`}
        style={{ imageRendering: "pixelated" }}
      />
    </motion.div>
  );
};

export default BookItem;
