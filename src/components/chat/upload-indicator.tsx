"use client";
import React from "react";
import { motion } from "framer-motion";

export function UploadIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-end mt-2"
    >
      <div className="bg-primary/20 text-primary rounded-full px-4 py-1.5 text-xs">
        <div className="flex items-center">
          <div className="animate-spin mr-2">
            <svg className="h-3 w-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          Uploading file...
        </div>
      </div>
    </motion.div>
  );
}
