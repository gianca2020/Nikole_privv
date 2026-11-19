import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function GoogleSignIn() {
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      setError("Couldn't start Google sign-in. Please try again.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full py-3 mt-4 bg-white text-black rounded-full text-base md:text-lg font-medium shadow-md flex items-center justify-center gap-2 hover:bg-gray-100"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt=""
          className="w-5 h-5"
        />
        Continue with Google
      </button>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm font-medium text-[#8f1d13]">
          {error}
        </p>
      )}
    </>
  );
}
