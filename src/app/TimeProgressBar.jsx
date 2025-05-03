// components/TimeProgressBar.js
import React from "react";

const TimeProgressBar = ({ timeLeft }) => {
  const progressPercentage = (timeLeft / 60) * 100;
  return (
    <div className="flex justify-center mb-3">
      <div className="w-1/2 bg-gray-300 rounded-full h-5">
        <div
          className="bg-[#E79743] h-5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}></div>
      </div>
    </div>
  );
};

export default TimeProgressBar;