import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import GoogleSignIn from "../components/GoogleSignIn";

const Login = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      } else {
        setChecking(false);
      }
    };

    checkSession();

    // Listen for auth state changes (handles OAuth callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1F1F1F]">
        <p className="text-[#F6F1E8]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1F1F1F]">
      <h1
        style={{ letterSpacing: "0.09em" }}
        className="transform -translate-y-6 md:-translate-y-10 text-4xl md:text-5xl lg:text-6xl text-[#F6F1E8] font-semibold"
      >
        Hello{" "}
        <span
          style={{ fontFamily: "'Dancing Script', cursive" }}
          className="ml-2"
        >
          Nikole
        </span>
      </h1>

      <div className="w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] max-w-lg bg-[#F6F1E8]/80 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-lg">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#1F1F1F] mb-6">
          Login
        </h2>

        {/* Google login */}
        <GoogleSignIn />
      </div>
    </div>
  );
};

export default Login;
