"use client";

import React from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  return (
    <header className="border-b border-border w-full py-3 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl font-bold text-foreground">SwiftBoard</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/pricing"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            Pricing
          </Link>
          <Link
            href="/features"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            Contact
          </Link>
          <button
            onClick={toggleDarkMode}
            className="ml-2 p-2 rounded-full hover:bg-secondary text-white"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
