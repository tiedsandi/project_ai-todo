"use client";

import { Menu, X } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="bg-backgroundSecondary text-background p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">RoadMind</h1>

        {/* Hamburger button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu Desktop */}
        <nav className="hidden md:flex gap-4 items-center">
          <Link href="/myproject" className="hover:underline">
            MyProject
          </Link>
          {user ? (
            <>
              <span className="text-sm">Hi, {user.displayName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-green-500 px-3 py-1 rounded"
            >
              Login Google
            </button>
          )}
        </nav>
      </div>

      {/* Menu Mobile */}
      {open && (
        <nav className="mt-4 flex flex-col gap-2 md:hidden">
          <Link href="/myproject" className="hover:underline">
            MyProject
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-green-500 px-3 py-1 rounded"
            >
              Login Google
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
