"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt with:", { email, password });
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
    <div className="flex h-screen w-full overflow-hidden rounded-lg bg-background shadow-glow dark:bg-dark-900 py-8 px-12">
      {/* Left side with illustration */}
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
                Break down complex projects into manageable tasks and subtasks.
                Assign responsibilities, set deadlines, and track real-time
                progress with an intuitive interface that keeps your team
                aligned.
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
                Gain deep insights into team performance, workload distribution,
                and project bottlenecks. Visualize progress with charts,
                generate custom reports, and optimize efficiency with
                data-driven decisions.
              </p>
            </div>
            <div className="p-8">
              <h3 className="text-4xl font-bold text-white mb-4">
                Dark Mode for Enhanced Focus
              </h3>
              <p className="text-lg text-white">
                Work comfortably with a sleek, professional dark theme designed
                for long hours of productivity. Reduce eye strain and improve
                focus while navigating your tasks effortlessly.
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
                Save time with automation rules that handle repetitive tasks.
                Seamlessly integrate with Jira, Notion, Trello, GitHub, and over
                100+ tools to streamline your workflow.
              </p>
            </div>
          </Slider>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full flex justify-center items-center lg:w-1/2">
        <div className="w-2/3 mx-auto border border-border rounded-lg p-8 bg-card dark:bg-dark-800">
          <div className="flex justify-between">
            <h1 className="mb-8 text-3xl font-bold text-foreground">Login</h1>
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

            <div className="mb-6 text-right">
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

          <div className="flex justify-center space-x-4">
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary">
              <FaGoogle className="h-6 w-6 text-primary" />
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary">
              <FaGithub className="h-6 w-6 text-primary" />
            </button>
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
      </div>
    </div>
  );
}
