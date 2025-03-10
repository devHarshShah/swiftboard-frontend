"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-background/50">
      <div className="relative flex flex-col items-center">
        <div className="absolute animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <div className="absolute animate-pulse h-16 w-16 flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">SB</span>
        </div>
        <div className="mt-24 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
