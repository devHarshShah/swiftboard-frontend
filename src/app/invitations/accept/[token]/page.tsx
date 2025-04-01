"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/src/lib/apiClient";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";

export default function InvitationAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<{ name?: string; role?: string }>(
    {},
  );
  const router = useRouter();

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
        setMessage(data.message || "You've successfully joined the team!");
        setTeamInfo({
          name: data.team?.name || "the team",
          role: data.role || "Member",
        });
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

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {}
      <header className="bg-white border-b border-gray-200 shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-semibold text-gray-800">SwiftBoard</h1>
        </div>
      </header>

      {}
      <main className="flex flex-grow items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-md">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Team Invitation
              </h2>
              <p className="mt-2 text-gray-600">
                {status === "loading" ? "Processing your invitation..." : ""}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center mt-6">
              {status === "loading" && (
                <div className="flex flex-col items-center space-y-4 py-6">
                  <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                  <p className="text-gray-600">Verifying your invitation...</p>
                </div>
              )}

              {status === "success" && (
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-800">
                    Welcome aboard!
                  </h3>
                  <p className="text-gray-600">
                    You&apos;ve successfully joined{" "}
                    {teamInfo.name || "the team"} as{" "}
                    {teamInfo.role || "a member"}.
                  </p>
                  <Button onClick={navigateToDashboard} className="mt-4 w-full">
                    Go to Dashboard
                  </Button>
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                  <div className="rounded-full bg-red-100 p-3">
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-800">
                    Something went wrong
                  </h3>
                  <p className="text-gray-600">{message}</p>
                  <div className="flex gap-3 mt-4 w-full">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                      className="flex-1"
                    >
                      Go Home
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {}
      <footer className="border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SwiftBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
