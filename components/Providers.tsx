"use client";

import { MotionConfig } from "framer-motion";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // reducedMotion="user": every framer-motion animation across the app
  // respects the OS prefers-reduced-motion setting by default.
  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>{children}</SessionProvider>
    </MotionConfig>
  );
}
