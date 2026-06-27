"use client";

import { useState } from "react";
import PremiumQuoteCategories from "@/components/subscription/PremiumQuoteCategories";
import PremiumSection from "@/components/subscription/PremiumSection";

const SubscriptionPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("motivation");

  return (
    <div>
      <PremiumSection selectedCategory={selectedCategory} />
      <PremiumQuoteCategories
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
};

export default SubscriptionPage;