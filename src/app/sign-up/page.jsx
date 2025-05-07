"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import backgroundImg from "./back.png"; // Book Blitz background
import simple from "./simple.png"; // Book Blitz logo

const Register = () => {
  const [formData, setFormData] = useState({ playerName: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Display the form to get the player's name
      setLoading(false);
      // Set a state to indicate that the user is authenticated but needs to enter a player name
      setIsGoogleSignInComplete(true);
      setGoogleUser(user);
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      alert("Error signing in with Google. Please try again.");
      setLoading(false);
    }
  };

  const [isGoogleSignInComplete, setIsGoogleSignInComplete] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

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
        playerName,
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

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!googleUser) throw new Error("Google user data not available.");

      const { playerName } = formData;

      const userRef = doc(db, "users", googleUser.uid);
      await setDoc(
        userRef,
        {
          playerName,
          highScore: 0,
          totalPlaytime: 0,
          highScorePlaytime: 0,
          userID: googleUser.uid,
        },
        { merge: true }
      );

      alert("Registration complete! Welcome, " + playerName);
      router.push("/");
    } catch (error) {
      console.error("Error completing Google registration: ", error);
      alert("Error completing registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = formData.playerName;

  const pixelatedButtonStyle = {
    backgroundColor: "#dc9844",
    color: "white",
    fontWeight: "bold",
    padding: "1.5rem 3rem",
    borderRadius: "0",
    boxShadow: "4px 4px 0 #b87729, 8px 8px 0 #935b1a",
    transition: "box-shadow 0.2s ease-in-out",
    fontSize: "1.8rem",
    border: "4px solid #b87729",
  };

  const pixelatedButtonHoverStyle = {
    boxShadow: "2px 2px 0 #b87729",
    backgroundColor: "#e6a854",
    borderColor: "#e6a854",
  };

  const pixelatedButtonActiveStyle = {
    boxShadow: "1px 1px 0 #935b1a",
    transform: "translate(2px, 2px)",
  };

  return (
    <>
      {!auth.currentUser ? (
        // Initial Google Sign-Up UI
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6 py-2 bg-repeat"
          style={{
            backgroundImage: `url(${backgroundImg.src})`,
            backgroundPosition: "center",
          }}>
          {/* Centered BookBlitz Logo */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[70vw] h-auto">
              <Image
                src={simple}
                alt="Simple Image"
                width={0}
                height={0}
                className="object-contain object-center w-full h-auto"
              />
            </div>
          </div>

          {/* Google Sign-Up Button */}
          <div className="w-full flex justify-center mt-8 relative z-10">
            <button
              onClick={handleGoogleSignIn}
              style={pixelatedButtonStyle}
              onMouseEnter={(e) =>
                Object.assign(e.target.style, pixelatedButtonHoverStyle)
              }
              onMouseLeave={(e) =>
                Object.assign(e.target.style, pixelatedButtonStyle)
              }
              className="w-[80vw] max-w-md flex items-center justify-center py-6 text-white border-gray-300 rounded-lg shadow-xl transform hover:scale-105 transition duration-200 ease-in-out text-lg font-bold"
              disabled={loading}>
              {loading ? "Signing In..." : "Sign up with Google"}
            </button>
          </div>

          {/* Footer */}
          <div className="w-full flex justify-center items-center mt-12 mb-4 relative z-10">
            <p className="text-yellow-300 text-lg text-center md:text-center">
              Already have an account?{" "}
              <a href="/sign-in" className="hover:underline">
                Log In
              </a>
            </p>
          </div>
        </div>
      ) : (
        // After Google Sign-In, show the player name input form
        <div
          className="min-h-screen flex items-center justify-center px-4 py-8 bg-repeat"
          style={{
            backgroundImage: `url(${backgroundImg.src})`,
            backgroundPosition: "center",
          }}>
          {/* Container with logo as background/frame */}
          <div className="relative w-[200vw] max-w-6xl aspect-[3/2]">
            {/* Book Blitz Image as Container */}
            <Image
              src={simple}
              alt="Book Blitz Logo"
              fill
              className="object-contain"
            />

            {/* Form Centered Inside Logo Container */}
            <div className="absolute left-0 right-0 top-[35%] flex justify-center p-3">
              <form
                onSubmit={isGoogleSignInComplete ? handleGoogleSubmit : handleSubmit}
                className="w-full max-w-md bg-transparent shadow-none p-0 space-y-6">
                <h2 className="text-4xl font-bold text-yellow-400 text-center mb-5">
                  {isGoogleSignInComplete ? "Complete Sign Up" : "Sign Up"}
                </h2>

                <div>
                  <label
                    htmlFor="playerName"
                    className="block text-lg font-semibold text-yellow-400 mb-2">
                    Player Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="playerName"
                    placeholder="Enter your player name"
                    value={formData.playerName}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={!isFormComplete || loading}
                    style={pixelatedButtonStyle}
                    onMouseEnter={(e) =>
                      Object.assign(e.target.style, pixelatedButtonHoverStyle)
                    }
                    onMouseLeave={(e) =>
                      Object.assign(e.target.style, pixelatedButtonStyle)
                    }
                    onMouseDown={(e) =>
                      Object.assign(e.target.style, pixelatedButtonActiveStyle)
                    }
                    onMouseUp={(e) =>
                      Object.assign(e.target.style, pixelatedButtonHoverStyle)
                    }
                    className="disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;