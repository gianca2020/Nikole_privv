import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../lib/useDocumentTitle";
import GoogleSignIn from "../components/GoogleSignIn";
import Button from "../components/ui/Button";

const Login = () => {
  useDocumentTitle("Sign in");
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();

  // Only approved admins are sent on; a signed-in non-admin stays here and sees why.
  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading || isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <p role="status" className="text-paper">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-ink">
      <h1
        style={{ letterSpacing: "0.09em" }}
        className="transform -translate-y-6 md:-translate-y-10 text-4xl md:text-5xl lg:text-6xl text-paper font-semibold"
      >
        Hello{" "}
        <span
          style={{ fontFamily: "'Dancing Script', cursive" }}
          className="ml-2"
        >
          Nikole
        </span>
      </h1>

      <div className="surface-paper w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] max-w-lg bg-paper/80 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-lg">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-ink mb-6">
          Login
        </h2>

        {user ? (
          <div role="alert" className="text-center">
            <p className="text-ink mb-4">
              <strong>{user.email}</strong> doesn't have access to this admin.
            </p>
            <Button variant="secondary" onClick={signOut}>
              Use a different Google account
            </Button>
          </div>
        ) : (
          <GoogleSignIn />
        )}
      </div>
    </div>
  );
};

export default Login;
