import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/config";
import { useState } from "react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-lg flex flex-col items-center gap-6">
        <h1 className="text-white text-3xl font-bold">Momentum</h1>
        <p className="text-gray-400 text-sm">Track consistency. Build momentum.</p>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}