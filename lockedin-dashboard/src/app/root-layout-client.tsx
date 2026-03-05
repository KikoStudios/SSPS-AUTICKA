'use client';

import { HeroUIProvider } from "@heroui/react";
import { ConvexClientProvider } from "./convex-provider";
import { AuthProvider } from "./auth-context";

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeroUIProvider>
      <ConvexClientProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ConvexClientProvider>
    </HeroUIProvider>
  );
}
