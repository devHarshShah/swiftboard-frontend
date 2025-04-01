"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  Check,
  ArrowLeft,
  HelpCircle,
  Star,
  Clock,
  Shield,
} from "lucide-react";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";
import { Toast } from "../ui/toast";
import Navbar from "../navbar";
import { Errors } from "@/src/types";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    description: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [step, setStep] = useState(1);

  const togglePasswordVisibility = (field: "password" | "confirm"): void => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email) {
        setErrors({
          ...errors,
          name: !formData.name ? "Name is required" : "",
          email: !formData.email ? "Email is required" : "",
        });
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Simulating API call
      const response: Response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          marketingOptIn,
        }),
      });

      const data: { error?: string } = await response.json();

      if (!response.ok) {
        console.error("Signup failed:", data.error);
        setToastMessage({
          title: "Signup Failed",
          description: data.error || "An error occurred",
        });
        setToastOpen(true);
      } else {
        setToastMessage({
          title: "Account Created",
          description:
            "Your account has been successfully created! Check your email for verification.",
        });
        setToastOpen(true);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    } catch {
      setToastMessage({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
      setToastOpen(true);
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: "" };

    // Check for various password strength indicators
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    let strength = 0;
    if (hasLowercase) strength += 1;
    if (hasUppercase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecialChar) strength += 1;
    if (isLongEnough) strength += 1;

    let label = "";
    if (strength <= 2) label = "Weak";
    else if (strength <= 3) label = "Medium";
    else if (strength <= 4) label = "Strong";
    else label = "Very Strong";

    return { strength, label };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="w-full">
      <div className="flex flex-col h-screen overflow-hidden bg-[#0F172A]">
        <Navbar />

        <div className="flex justify-center items-center flex-1 py-8 px-12">
          {}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-800 to-indigo-900 text-white p-8 relative h-full rounded-2xl">
            <div className="flex flex-col h-full w-full">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">
                  Join Swiftboard and transform your workflow
                </h1>
                <p className="text-blue-100">
                  Create a free account and discover how our platform helps
                  teams stay organized, focused, and productive.
                </p>
              </div>

              <div className="space-y-6 mt-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Collaborate Seamlessly</h3>
                    <p className="text-sm text-blue-100">
                      Work together with your team in real-time, share files,
                      and communicate efficiently.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Track Progress Easily</h3>
                    <p className="text-sm text-blue-100">
                      Visualize project timelines, milestone achievements, and
                      individual contributions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Stay Organized</h3>
                    <p className="text-sm text-blue-100">
                      Keep all your tasks, notes, and documents in one
                      centralized workspace.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Save Valuable Time</h3>
                    <p className="text-sm text-blue-100">
                      Automate routine tasks and focus on what truly matters
                      with our smart workflow tools.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Enterprise-Grade Security</h3>
                    <p className="text-sm text-blue-100">
                      Your data is protected with end-to-end encryption and
                      advanced security protocols.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white bg-opacity-10 p-4 rounded-lg border border-blue-600">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-yellow-300 mr-1" />
                  <Star className="h-5 w-5 text-yellow-300 mr-1" />
                  <Star className="h-5 w-5 text-yellow-300 mr-1" />
                  <Star className="h-5 w-5 text-yellow-300 mr-1" />
                  <Star className="h-5 w-5 text-yellow-300 mr-1" />
                </div>
                <p className="text-sm italic">
                  &quot;Swiftboard has revolutionized how our team collaborates.
                  We&apos;ve increased productivity by 35% since implementing
                  it!&quot;
                </p>
                <p className="text-xs mt-2 font-semibold">
                  — Sarah Johnson, Product Manager at TechCorp
                </p>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between text-sm border-t border-blue-700 pt-4">
                  <span>Already have an account?</span>
                  <Link
                    href="/login"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="w-full md:w-1/2 bg-[#0F172A] overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 py-8 h-full">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">
                  Create your account
                </h1>
                <button className="p-1 rounded-full hover:bg-blue-900/30">
                  <HelpCircle className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-6">
                  <p className="text-gray-400 mb-6">
                    Let&apos;s get started with your free account. No credit
                    card required.
                  </p>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full rounded-lg border ${
                          errors.name ? "border-red-500" : "border-gray-700"
                        } pl-10 pr-3 py-3 text-white bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full rounded-lg border ${
                          errors.email ? "border-red-500" : "border-gray-700"
                        } pl-10 pr-3 py-3 text-white bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0F172A] transition-colors"
                    >
                      Continue
                    </button>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-grow border-t border-gray-700"></div>
                      <span className="flex-shrink mx-4 text-sm text-gray-400">
                        Or sign up with
                      </span>
                      <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <button className="flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg py-3 hover:bg-gray-700 transition-colors">
                        <FaGoogle className="text-gray-300" />
                      </button>
                      <button className="flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg py-3 hover:bg-gray-700 transition-colors">
                        <FaGithub className="text-gray-300" />
                      </button>
                      <button className="flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg py-3 hover:bg-gray-700 transition-colors">
                        <FaApple className="text-gray-300" />
                      </button>
                    </div>
                  </div>

                  {}
                  <div className="mt-8 pt-4 border-t border-gray-700 text-center md:hidden">
                    <p className="text-gray-400">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="text-blue-400 hover:underline"
                      >
                        Log in
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center text-blue-400 hover:text-blue-300"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      <span>Back</span>
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-4">
                    Set up your password
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Create a strong password to secure your account
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`block w-full rounded-lg border ${
                            errors.password
                              ? "border-red-500"
                              : "border-gray-700"
                          } pl-10 pr-10 py-3 text-white bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => togglePasswordVisibility("password")}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.password}
                        </p>
                      )}

                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex-1 flex space-x-1">
                              {[1, 2, 3, 4, 5].map((num) => (
                                <div
                                  key={num}
                                  className={`h-1.5 flex-1 rounded-full ${
                                    num <= passwordStrength.strength
                                      ? passwordStrength.strength <= 2
                                        ? "bg-red-500"
                                        : passwordStrength.strength <= 3
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                      : "bg-gray-700"
                                  }`}
                                />
                              ))}
                            </div>
                            <span
                              className={`text-xs font-medium ml-2 ${
                                passwordStrength.strength <= 2
                                  ? "text-red-500"
                                  : passwordStrength.strength <= 3
                                    ? "text-yellow-500"
                                    : "text-green-500"
                              }`}
                            >
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Use 8+ characters with a mix of letters, numbers &
                            symbols
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`block w-full rounded-lg border ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-700"
                          } pl-10 pr-10 py-3 text-white bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="terms"
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={() => setTermsAccepted(!termsAccepted)}
                            className="w-4 h-4 border border-gray-700 rounded bg-gray-800 focus:ring-3 focus:ring-blue-500 text-blue-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="terms" className="text-gray-400">
                            I agree to the{" "}
                            <Link
                              href="/terms"
                              className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy"
                              className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              Privacy Policy
                            </Link>
                          </label>
                          {errors.terms && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.terms}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="marketing"
                            type="checkbox"
                            checked={marketingOptIn}
                            onChange={() => setMarketingOptIn(!marketingOptIn)}
                            className="w-4 h-4 border border-gray-700 rounded bg-gray-800 focus:ring-3 focus:ring-blue-500 text-blue-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="marketing" className="text-gray-400">
                            I agree to receive product updates and marketing
                            communications
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0F172A] transition-colors"
                    >
                      Create Account
                    </button>
                  </form>
                </div>
              )}

              <div className="mt-8 text-center text-sm text-gray-400">
                <div className="flex justify-center space-x-4">
                  <Link href="/help" className="hover:text-blue-400">
                    Help
                  </Link>
                  <Link href="/privacy" className="hover:text-blue-400">
                    Privacy
                  </Link>
                  <Link href="/terms" className="hover:text-blue-400">
                    Terms
                  </Link>
                  <Link href="/contact" className="hover:text-blue-400">
                    Contact
                  </Link>
                </div>
                <p className="mt-2">
                  © 2025 Swiftboard Inc. All rights reserved.
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
    </div>
  );
}
