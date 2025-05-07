'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import backgroundImg from './back.png'; // Assuming the image is in the same directory
import simple from './simple.png';
import Image from 'next/image'; // Import the Image component

const SignIn = () => {
  const [showGoogleError, setShowGoogleError] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      router.push("/"); // Redirect after successful sign-in
    } catch (e) {
      console.error(e);
      setShowGoogleError(true);
      setTimeout(() => setShowGoogleError(false), 3000); // Clear error message after 3 seconds
    } finally {
      setGoogleLoading(false);
    }
  };

  const pixelatedButtonStyle = {
    backgroundColor: '#dc9844', // Golden orange
    color: 'white',
    fontWeight: 'bold',
    padding: '1.5rem 3rem', // Even larger padding
    borderRadius: '0', // Remove border-radius for sharp edges
    boxShadow: '4px 4px 0 #b87729, 8px 8px 0 #935b1a', // Stepped shadow
    transition: 'box-shadow 0.2s ease-in-out',
    fontSize: '1.8rem', // Even larger font size
    border: '4px solid #b87729', // Thicker border
  };

  const pixelatedButtonHoverStyle = {
    boxShadow: '2px 2px 0 #b87729', // Slightly move shadow on hover
    backgroundColor: '#e6a854', // Slightly lighter on hover
    borderColor: '#e6a854',
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-2 bg-repeat" // Added bg-repeat class
      style={{
        backgroundImage: `url(${backgroundImg.src})`, // Use backgroundImg.src
        // backgroundSize: "cover", // Removed cover to enable tiling
        backgroundPosition: "center",
      }}
    >
      {/* Simple Image */}
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

      {/* Google Sign-In Button */}
      <div className="w-full flex justify-center mt-8 relative z-10"> {/* Added relative z-10 */}
        {showGoogleError && (
          <p className="text-red-500 text-center mb-4 text-lg font-semibold">
            Error with Google Sign-In. Please try again.
          </p>
        )}
        <button
          onClick={handleGoogleSignIn}
          style={pixelatedButtonStyle}
          onMouseEnter={(e) => Object.assign(e.target.style, pixelatedButtonHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.target.style, pixelatedButtonStyle)}
          className="w-[80vw] max-w-md flex items-center justify-center py-6 text-white border-gray-300 rounded-lg shadow-xl transform hover:scale-105 transition duration-200 ease-in-out text-lg font-bold" // Adjusted width, padding, font, and added font-bold
          disabled={googleLoading}
        >
          {googleLoading ? "Signing In..." : "Sign in with Google"}
        </button>
      </div>

      {/* Footer Section:  */}
      <div className="w-full flex justify-center items-center mt-12 mb-4 relative z-10"> {/* Added relative z-10 */}
        <p className="text-yellow-300 text-lg text-center md:text-center">
          New to Book Blitz? <a href="/sign-up" className="hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;






