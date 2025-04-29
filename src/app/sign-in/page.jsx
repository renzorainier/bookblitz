'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-brown-700 to-brown-900 px-6 py-10">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-bg- mt-4 drop-shadow-lg">
          Book Blitz
        </h1>
      </div>




      {/* Google Sign-In Button */}
      <div className="w-full flex justify-center mt-6">
        {showGoogleError && (
          <p className="text-red-500 text-center mb-4 text-sm font-semibold">
            Error with Google Sign-In. Please try again.
          </p>
        )}
        <button
          onClick={handleGoogleSignIn}
          className="w-[360px] md:w-[400px] flex items-center justify-center py-3 bg-gradient-to-r from-[#B14E0B] to-[#4B1E1D] text-white border border-gray-300 rounded-lg shadow-lg transform hover:scale-105 transition duration-200 ease-in-out text-sm"
          disabled={googleLoading}
        >
          {googleLoading ? "Signing In..." : "Sign in"}
        </button>
      </div>

      {/* Footer Section:  */}
      <div className="w-full flex justify-center items-center mt-6 mb-2">
        <p className="text-yellow text-sm text-center md:text-center">
          <a href="/sign-up" className="text-yellow-300 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
