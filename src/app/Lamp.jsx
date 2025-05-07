// components/Lamp.js
import React from "react";
import Image from "next/image";
import lampOnImage from ".//images/lamp_on.png";
import lampOffImage from ".//images/lamp_off.png";

const Lamp = ({ isOn, position }) => {
  const style =
    position === "left"
      ? { top: -40, left: -70 }
      : { top: -40, right: -70 };

  return (
    <div className={`absolute z-40 pointer-events-none`} style={style}>
      <Image
        src={isOn ? lampOnImage : lampOffImage}
        alt={`${position} Lamp`}
        width={500} // Increased width
        height={180} // Increased height
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};

export default Lamp;