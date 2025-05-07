// components/Scoreboard.js
import React from "react";
import Image from "next/image";
import emptyImage from ".//images/empty.png";

const Scoreboard = ({ timeLeft, score, totalPlayTime }) => {
  const stats = [
    { label: "Time Left", value: `${timeLeft}s`, imageAlt: "Time Background" },
    { label: "Score", value: score, imageAlt: "Score Background" },
    {
      label: "Play Time",
      value: `${totalPlayTime}s`,
      imageAlt: "Play Time Background",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 text-center">
      {stats.map(({ label, value, imageAlt }) => (
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
  );
};

export default Scoreboard;