"use client";

import { useRouter } from "next/navigation";
import UseExistingQuote from "@/components/admin/quote-assignments/UseExistingQuote";

export default function UseExistingQuotePage() {
  const router = useRouter();

  return (
    <UseExistingQuote
      editingAssignment={null}
      onClose={() => router.push("/dashboard/admin/quotes")}
      onSuccess={() => router.push("/dashboard/admin/quotes")}
    />
  );
}