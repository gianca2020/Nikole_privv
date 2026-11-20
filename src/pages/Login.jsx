import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../lib/useDocumentTitle";
import GoogleSignIn from "../components/GoogleSignIn";
import Button from "../components/ui/Button";
import NotebookCover from "../components/journal/NotebookCover";

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
      <div className="desk login-desk">
        <p role="status" className="font-hand text-2xl text-paper/80">Opening the notebook…</p>
      </div>
    );
  }

  return (
    <div className="desk login-desk">
      <main className="grid justify-items-center gap-5">
        <h1 className="sr-only">Nikole’s Admin: sign in</h1>
        <div className="login-cover">
          <NotebookCover />
        </div>

        <div className="login-label">
          <p className="mb-3 text-center text-ink-muted">
            Sign in to manage your portfolio.
          </p>

          {user ? (
            <div role="alert" className="text-center">
              <p className="mb-4 text-ink">
                <strong className="break-all font-normal underline decoration-accent decoration-2">{user.email}</strong> doesn't have access to this admin.
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
    </div>
  );
};

export default Login;
