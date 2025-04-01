"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import nookies from "nookies";
import { Suspense } from "react";

const RedirectPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  useEffect(() => {
    if (accessToken && refreshToken) {
      nookies.set(null, "access_token", accessToken as string, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      nookies.set(null, "refresh_token", refreshToken as string, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      router.push("/dashboard");
    }
  }, [accessToken, refreshToken, router]);

  return <div>Redirecting...</div>;
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RedirectPage />
  </Suspense>
);

export default Page;
