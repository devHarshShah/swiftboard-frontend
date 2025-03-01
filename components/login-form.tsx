"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Info, HelpCircle } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Toast } from "./ui/toast";
import Navbar from "./navbar";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    description: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Login failed:", data.error);
      setToastMessage({ title: "Login Failed", description: data.error });
      setToastOpen(true);
    } else {
      console.log("Login successful:", data);
      setToastMessage({
        title: "Login Successful",
        description: "You have successfully logged in.",
      });
      setToastOpen(true);
    }
  };

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000,
  };

  return (
    <div className={`w-full`}>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-background dark:bg-dark-900">
        <Navbar />
        <div className="flex flex-1 w-full rounded-lg shadow-glow py-8 px-12">
          {/* Left side with slider */}
          <div className="relative hidden w-1/2 lg:block">
            <div className="flex items-center justify-center p-8 h-full">
              <Image
                src="/illustration.jpg"
                alt="Login illustration"
                layout="fill"
                className="object-cover rounded-3xl"
                priority
              />
            </div>
            <div className="absolute bottom-0 w-full">
              <Slider {...settings}>
                <div className="p-8">
                  <h3 className="text-4xl font-bold text-white mb-4">
                    Task & Subtask Management
                  </h3>
                  <p className="text-lg text-white">
                    Break down complex projects into manageable tasks and
                    subtasks. Assign responsibilities, set deadlines, and track
                    real-time progress with an intuitive interface that keeps
                    your team aligned.
                  </p>
                </div>
                <div className="p-8">
                  <h3 className="text-4xl font-bold text-white mb-4">
                    Seamless Collaboration
                  </h3>
                  <p className="text-lg text-white">
                    Foster teamwork with built-in chat, comments, and @mentions.
                    Share files, provide feedback instantly, and integrate with
                    Slack, Teams, and email for a connected workflow.
                  </p>
                </div>
                <div className="p-8">
                  <h3 className="text-4xl font-bold text-white mb-4">
                    Advanced Analytics & Reports
                  </h3>
                  <p className="text-lg text-white">
                    Gain deep insights into team performance, workload
                    distribution, and project bottlenecks. Visualize progress
                    with charts, generate custom reports, and optimize
                    efficiency with data-driven decisions.
                  </p>
                </div>
                <div className="p-8">
                  <h3 className="text-4xl font-bold text-white mb-4">
                    Dark Mode for Enhanced Focus
                  </h3>
                  <p className="text-lg text-white">
                    Work comfortably with a sleek, professional dark theme
                    designed for long hours of productivity. Reduce eye strain
                    and improve focus while navigating your tasks effortlessly.
                  </p>
                </div>
                <div className="p-8">
                  <h3 className="text-4xl font-bold text-white mb-4">
                    Secure & Scalable Infrastructure
                  </h3>
                  <p className="text-lg text-white">
                    Built on enterprise-grade architecture, our platform ensures
                    your data is encrypted and protected with robust security
                    measures. Scale effortlessly as your team grows, without
                    compromising performance.
                  </p>
                </div>
                <div className="p-8">
                  <h3 className="text-4xl font-bold text-white mb-4">
                    Automations & Integrations
                  </h3>
                  <p className="text-lg text-white">
                    Save time with automation rules that handle repetitive
                    tasks. Seamlessly integrate with Jira, Notion, Trello,
                    GitHub, and over 100+ tools to streamline your workflow.
                  </p>
                </div>
              </Slider>
            </div>
          </div>

          <div className="w-full flex flex-col justify-center items-center lg:w-1/2">
            <div className="w-2/3 mx-auto border border-border rounded-lg p-8 bg-card dark:bg-dark-800">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-foreground">Login</h1>
                <button className="p-1 rounded-full hover:bg-secondary">
                  <HelpCircle className="h-5 w-5 text-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md border border-input bg-card p-2.5 pl-10 text-foreground focus:border-primary focus:outline-none focus:ring-primary"
                      placeholder="daniel21fisher@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border border-input bg-card p-2.5 pr-10 text-foreground focus:border-primary focus:outline-none focus:ring-primary"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-muted-foreground"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-primary px-5 py-3 text-center text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30"
                >
                  Log In
                </button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="mx-4 flex-shrink text-muted-foreground">
                  Or Continue With
                </span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  className="flex h-12 items-center justify-center rounded-md border border-border bg-card hover:bg-secondary"
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`}
                >
                  <FaGoogle className="h-5 w-5 text-primary" />
                </Link>
                <button className="flex h-12 items-center justify-center rounded-md border border-border bg-card hover:bg-secondary">
                  <FaGithub className="h-5 w-5 text-primary" />
                </button>
              </div>

              <div className="mt-6 rounded-md bg-blue-50 dark:bg-blue-900/30 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3 text-sm text-blue-600 dark:text-blue-400">
                    <p>
                      By logging in, you agree to our{" "}
                      <Link href="/terms" className="font-medium underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="font-medium underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:text-primary/80 hover:underline"
                >
                  Sign Up here
                </Link>
              </p>
            </div>

            {/* Additional elements below the form */}
            <div className="mt-8 w-2/3 text-center">
              <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                <Link href="/help" className="hover:text-foreground">
                  Help Center
                </Link>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-foreground">
                  Terms
                </Link>
                <Link href="/security" className="hover:text-foreground">
                  Security
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                © 2025 SwiftBoard Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toast
        title={toastMessage.title}
        description={toastMessage.description}
        open={toastOpen}
        onOpenChange={setToastOpen}
      />
    </div>
  );
}
