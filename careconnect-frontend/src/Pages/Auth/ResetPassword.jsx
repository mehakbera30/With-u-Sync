import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import api from "../../services/api";
import ThemeToggle from "../../components/ThemeToggle";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.auth.resetPassword(token, password);
      setSuccess(response.message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
            <LockKeyhole size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Choose a new password
            </h1>
            <p className="text-sm text-slate-500">This link is valid for 15 minutes.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-teal-50 text-teal-700 text-sm">
            {success} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            minLength={6}
            className={inputClass}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={6}
            className={inputClass}
          />
          <button
            disabled={loading || !!success}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold disabled:opacity-60"
          >
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="text-teal-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
