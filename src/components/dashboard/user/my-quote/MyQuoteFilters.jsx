"use client";

import { Search, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "love", name: "Love" },
  { id: "strength", name: "Strength" },
  { id: "healing", name: "Healing" },
  { id: "faith", name: "Faith" },
  { id: "gratitude", name: "Gratitude" },
];

export default function MyQuoteFilters({ filters }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />

          <Input
            type="text"
            placeholder="Search quotes..."
            value={filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
            className="w-full bg-[#121526] border-white/5 rounded-xl h-11 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-500 focus-visible:ring-violet-500/50"
          />
        </div>

        <Select
          value={filters.category}
          onValueChange={filters.setCategory}
        >
          <SelectTrigger className="w-full sm:w-44 bg-[#121526] border-white/5 rounded-xl h-11 text-gray-300 hover:bg-[#1a1e36]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent className="bg-[#121526] border-white/10 text-gray-200">
            {CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={filters.setSort}
        >
          <SelectTrigger className="w-full sm:w-44 bg-[#121526] border-white/5 rounded-xl h-11 text-gray-300 hover:bg-[#1a1e36]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>

          <SelectContent className="bg-[#121526] border-white/10 text-gray-200">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="favorites">Favorites First</SelectItem>
            <SelectItem value="alpha">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => filters.handleViewChange("grid")}
          className={`rounded-lg ${
            filters.view === "grid"
              ? "bg-violet-600/20 text-violet-400"
              : "bg-[#121526] text-gray-500 hover:bg-[#1a1e36]"
          }`}
        >
          <Grid className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => filters.handleViewChange("list")}
          className={`rounded-lg ${
            filters.view === "list"
              ? "bg-violet-600/20 text-violet-400"
              : "bg-[#121526] text-gray-500 hover:bg-[#1a1e36]"
          }`}
        >
          <List className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}