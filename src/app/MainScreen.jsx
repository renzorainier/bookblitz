import React, { useState } from 'react';
import SortingGame from './SortingGame';
import Leaderboard from './Leaderboard';
import backgroundImage from './back.png';
import simple from './simple.png';
import Image from 'next/image';

const MainScreen = ({ userData }) => {
  const [activeScreen, setActiveScreen] = useState(null);

  const handlePlayClick = () => {
    setActiveScreen('play');
  };

  const handleLeaderboardsClick = () => {
    setActiveScreen('leaderboards');
  };

  const handleBackClick = () => {
    setActiveScreen(null);
  };

  const pixelatedButtonStyle = {
    backgroundColor: '#dc9844', // Golden orange
    color: 'white',
    fontWeight: 'bold',
    padding: '1.2rem 2.5rem', // Increased padding
    borderRadius: '0', // Remove border-radius for sharp edges
    boxShadow: '3px 3px 0 #b87729, 6px 6px 0 #935b1a', // Stepped shadow
    transition: 'box-shadow 0.2s ease-in-out',
    fontSize: '1.5rem', // Increased font size
    border: '3px solid #b87729', // Increased border width
  };

  const pixelatedButtonHoverStyle = {
    boxShadow: '1px 1px 0 #b87729', // Slightly move shadow on hover
    backgroundColor: '#e6a854', // Slightly lighter on hover
    borderColor: '#e6a854',
  };

  if (activeScreen === 'play') {
    return (
      <div
        className="flex min-h-screen bg-repeat items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage.src})` }}
      >
        <div className="relative w-full h-full">
          <SortingGame userData={userData} />
          <button
            onClick={handleBackClick}
            style={{ ...pixelatedButtonStyle, padding: '1rem 2rem', fontSize: '1.3rem', border: '2px solid #b87729', boxShadow: '2px 2px 0 #b87729, 4px 4px 0 #935b1a' }}
            onMouseEnter={(e) => Object.assign(e.target.style, pixelatedButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, pixelatedButtonStyle)}
            className="fixed bottom-6 left-6 text-white font-bold transition duration-300 ease-in-out z-70" // Adjusted positioning slightly
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  if (activeScreen === 'leaderboards') {
    return (
      <div
        className="flex min-h-screen bg-repeat items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage.src})` }}
      >
        <div className="relative w-full h-full">
          <Leaderboard userData={userData} />
          <button
            onClick={handleBackClick}
            style={{ ...pixelatedButtonStyle, padding: '1rem 2rem', fontSize: '1.3rem', border: '2px solid #b87729', boxShadow: '2px 2px 0 #b87729, 4px 4px 0 #935b1a' }}
            onMouseEnter={(e) => Object.assign(e.target.style, pixelatedButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, pixelatedButtonStyle)}
            className="fixed bottom-6 left-6 text-white font-bold transition duration-300 ease-in-out z-100" // Adjusted positioning slightly
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex min-h-screen bg-repeat items-center justify-center relative"
      style={{ backgroundImage: `url(${backgroundImage.src})` }}
    >
      {/* Render the simple image */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[70vw] h-auto">
          <Image
            src={simple}
            alt="Simple Image"
            width={0}
            height={0}
            className="object-contain object-center w-full h-auto "
          />
        </div>
      </div>

      <div className=" p-16 rounded-xl w-full max-w-md relative z-10"> {/* Increased padding here */}
        <div className="flex flex-col items-center justify-center h-full">
          <button
            onClick={handlePlayClick}
            style={{ ...pixelatedButtonStyle, marginBottom: '2rem' }} // Increased margin
            onMouseEnter={(e) => Object.assign(e.target.style, pixelatedButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, pixelatedButtonStyle)}
          >
            Play
          </button>
          <button
            onClick={handleLeaderboardsClick}
            style={pixelatedButtonStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, pixelatedButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, pixelatedButtonStyle)}
          >
            Leaderboards
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;