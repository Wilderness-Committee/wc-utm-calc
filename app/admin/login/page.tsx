"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get("next") || "/admin");
      router.refresh();
    } else {
      setError("Incorrect admin password");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <label className="block text-sm font-medium mb-1">Admin password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLogin() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
