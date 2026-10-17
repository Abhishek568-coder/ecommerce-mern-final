import { useNavigate } from "react-router-dom";
import { LogIn, ShoppingBag } from "lucide-react";
import "./loginPrompt.css";

/**
 * Friendly "you need to be logged in" card.
 *
 * Used anywhere a protected action/page is reached without a valid
 * session (guests, or an expired token) so the user gets a clear
 * call-to-action instead of a raw 401 error.
 */
function LoginPrompt({
  title = "Please login",
  message = "You need to be logged in to continue.",
  hint,
  continueTo = "/",
  continueLabel = "Continue Shopping",
  onLogin,
}) {
  const navigate = useNavigate();

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
      return;
    }

    navigate("/login");
  };

  return (
    <div className="login-prompt">
      <div className="login-prompt-card">
        <span className="login-prompt-icon">
          <LogIn size={26} />
        </span>

        <h3 className="login-prompt-title">{title}</h3>

        {message && <p className="login-prompt-message">{message}</p>}

        {hint && <p className="login-prompt-hint">{hint}</p>}

        <div className="login-prompt-actions">
          <button
            type="button"
            className="login-prompt-btn primary"
            onClick={handleLogin}
          >
            <LogIn size={18} />
            Login / Sign Up
          </button>

          <button
            type="button"
            className="login-prompt-btn ghost"
            onClick={() => navigate(continueTo)}
          >
            <ShoppingBag size={18} />
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPrompt;
