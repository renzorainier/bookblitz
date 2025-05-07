// components/BookShelf.js
import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import bookImages from "./BookImages";
import shelfImage from ".//images/Shelf.png";
import Arrow from ".//images/Arrow.gif";
import BookItem from "./BookItem";

const BookShelf = ({
  array,
  selectedIndex,
  isLevelCompleteAnimating,
  bookMotionValues,
  onBookClick,
}) => {
  return (
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
            <BookItem
              key={value}
              value={value}
              index={index}
              selectedIndex={selectedIndex}
              isLevelCompleteAnimating={isLevelCompleteAnimating}
              motionValue={bookMotionValues[index]}
              onBookClick={onBookClick}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookShelf;