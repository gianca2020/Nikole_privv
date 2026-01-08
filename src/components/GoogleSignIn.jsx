import { useEffect } from "react";
import { supabase } from "../lib/supabase";

const allowedEmails = [
  "giancarloforero@gmail.com",
  "nikolerajgor1@gmail.com",
];

export default function GoogleSignIn() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const email = session.user.email;

        if (!allowedEmails.includes(email)) {
          await supabase.auth.signOut();
          alert("This email is not authorized.");
          window.location.reload();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      className="w-full py-3 mt-4 bg-white text-black rounded-full text-base md:text-lg font-medium shadow-md flex items-center justify-center gap-2 hover:bg-gray-100"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Continue with Google
    </button>
  );
}
