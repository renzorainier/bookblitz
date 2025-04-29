"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import teen from "../img.png";
import logo from "./search.png";

const Register = () => {
  const [formData, setFormData] = useState({
    playerName: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const playerName = user.displayName || "";

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        playerName: playerName,
        highScore: 0,
        totalPlaytime: 0,
        highScorePlaytime: 0,
        userID: user.uid,
      }, { merge: true });

      alert("Registration complete! Welcome, " + playerName);
      router.push("/");
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      alert("Error signing in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User is not authenticated");

      const { playerName } = formData;

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        playerName: playerName,
        highScore: 0,
        totalPlaytime: 0,
        highScorePlaytime: 0,
        userID: user.uid,
      });

      alert("Registration complete! Welcome, " + playerName);
      router.push("/");
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Error completing registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = formData.playerName;

  return (
    <>
      {!auth.currentUser ? (
        // Initial Sign-Up View

        <div className="min-h-screen flex flex-col items-center justify-between bg-[#F8FBFF] px-6 py-10">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <Image src={teen} width={220} height={200} alt="KommUnity Logo" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-700 mt-4">KommUnity</h1>
          </div>

          {/* Sign Up Header */}
          <div className="w-full flex flex-col items-center md:items-start px-6 md:px-8 mb-6">
            <h2 className="text-2xl font-extrabold text-gray-700 mb-2">Sign Up</h2>
            <p className="text-gray-600 text-sm text-center md:text-left">
              By continuing, you are agreeing to our{" "}
              <a href="/terms" className="text-blue-500 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-500 hover:underline">
                Privacy Policy
              </a>.
            </p>
          </div>

          {/* Google Sign-up Button */}
          <div className="w-full flex justify-center mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-[350px] md:w-[400px] flex items-center justify-center py-3 bg-white text-gray-800 border border-gray-300 rounded-full shadow-md hover:bg-[#F8FBFF] font-roboto-mono"
              disabled={loading}
            >
              <Image
                src={logo}
                width={20}
                height={20}
                alt="Google Icon"
                className="mr-2"
              />
              {loading ? "Signing up with Google..." : "Continue with Google"}
            </button>
          </div>

          {/* Footer Section */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm font-roboto-mono">
              Already have an account?{" "}
              <a href="/sign-in" className="text-blue-500 hover:underline">
                Log In
              </a>
            </p>
          </div>
        </div>

      ) : (
        // Registration Form
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
          {/* Logo Section */}
          <div className="flex flex-center items-center mb-8">
            <Image
              src={teen}
              alt="KommUnity Logo"
              width={100}
              height={40}
            />
            <h1 className="text-5xl font-bold text-gray-800 mt-4">KommUnity</h1>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 text-left">
              Sign Up
            </h2>

            {/* Player Name */}
            <div>
              <label
                htmlFor="playerName"
                className="block text-sm font-semibold text-gray-700">
                Player Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="playerName"
                placeholder="Enter your player name"
                value={formData.playerName}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormComplete}
              className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Register;