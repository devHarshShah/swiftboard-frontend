"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

export default function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const { token } = await params;
      setToken(token);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    const acceptInvitation = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid invitation link");
        return;
      }

      try {
        const response = await apiClient("/api/teams/accept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to accept invitation");
        }

        const data = await response.json();
        console.log("Invitation accepted:", data);
        setStatus("success");
        setMessage("You've successfully joined the team!");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } catch (error) {
        console.error("Error accepting invitation:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to accept invitation",
        );
      }
    };

    if (token) {
      acceptInvitation();
    }
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Team Invitation</h1>

        {status === "loading" && (
          <div className="text-center">
            <p>Processing your invitation...</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-pulse bg-blue-500"></div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="mt-2">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="mt-2">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
