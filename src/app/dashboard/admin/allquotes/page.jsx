"use client";

import { useRouter } from "next/navigation";
import ViewAllQuotes from "@/components/admin/quote-assignments/ViewAllQuotes";

export default function AllQuotesPage() {
  const router = useRouter();

  return (
    <ViewAllQuotes
      onClose={() => router.push("/dashboard/admin/quotes")}
    />
  );
}