import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import GoogleSignIn from "../components/GoogleSignIn";

const Login = () => {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

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
