"use client";

import useAuthInit from "@/hooks/useAuthInit";

export default function AuthProvider({ children }) {
  useAuthInit();
  return children;
}