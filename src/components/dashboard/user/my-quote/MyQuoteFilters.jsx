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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />

          <Input
            type="text"
            placeholder="Search quotes..."
            value={filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
            className="w-full bg-card border-border rounded-xl h-11 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
          />
        </div>

        <Select
          value={filters.category}
          onValueChange={filters.setCategory}
        >
          <SelectTrigger className="w-full sm:w-44 bg-card border-border rounded-xl h-11 text-foreground hover:bg-muted">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent className="bg-popover border-border text-popover-foreground">
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
          <SelectTrigger className="w-full sm:w-44 bg-card border-border rounded-xl h-11 text-foreground hover:bg-muted">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>

          <SelectContent className="bg-popover border-border text-popover-foreground">
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
              ? "bg-primary/20 text-primary"
              : "bg-card text-muted-foreground hover:bg-muted"
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
              ? "bg-primary/20 text-primary"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <List className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
