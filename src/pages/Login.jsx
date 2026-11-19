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
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p role="status" className="text-ink-muted">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-paper">
      <h1 className="mb-8 font-serif text-5xl md:text-6xl font-bold tracking-tight text-ink text-center">
        Hello, <span className="text-accent">Nikole</span>
      </h1>

      <div className="w-full max-w-md bg-surface border border-rule rounded-2xl p-8 shadow-sm">
        <p className="text-center text-ink-muted mb-2">
          Sign in to manage your portfolio.
        </p>

        {user ? (
          <div role="alert" className="mt-4 text-center">
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
    </main>
  );
};

export default Login;
