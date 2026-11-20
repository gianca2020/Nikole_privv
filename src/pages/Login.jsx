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
      <div className="desk login-desk">
        <p role="status" className="font-hand text-3xl text-paper/80">Opening the notebook…</p>
      </div>
    );
  }

  return (
    <div className="desk login-desk">
      <main className="login-cover">
        <div className="cover-card">
          <div className="cover-topline"><span>The reporter’s companion</span><span>No. 01</span></div>
          <p className="cover-hand">private — book one</p>
          <h1 className="cover-title">Nikole’s<br />Admin</h1>
          <p className="cover-stamp" aria-hidden="true">Memo<br />Book</p>
          <div className="cover-rule" />
          <div className="cover-seal" aria-hidden="true">Heavy<br />weight<br />No. 01<br />100 lvs.</div>

          <div className="cover-actions">
            <div className="cover-label">
              <p className="mb-3 text-center text-ink-muted">
                Sign in to manage your portfolio.
              </p>

              {user ? (
                <div role="alert" className="text-center">
                  <p className="mb-4 text-ink">
                    <strong className="break-all">{user.email}</strong> doesn't have access to this admin.
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
          <p className="cover-bottom"><span>Heavyweight paper</span><span>Property of N. Rajgor</span></p>
        </div>
      </main>
    </div>
  );
};

export default Login;
