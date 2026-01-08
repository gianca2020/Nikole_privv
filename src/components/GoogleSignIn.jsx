import { supabase } from "../lib/supabase";

export default function GoogleSignIn() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Google login error:", error.message);
    }
  };

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
