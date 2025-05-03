"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationFooterProps {
  hasData: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export default function PaginationFooter({
  hasData,
  currentPage,
  totalPages,
  setCurrentPage,
}: PaginationFooterProps) {
  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-6 pt-0">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 flex items-center gap-1"
          disabled={!hasData || currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        <div className="flex gap-1">
          {hasData &&
            generatePaginationNumbers().map((item, index) => (
              <Button
                key={index}
                variant={currentPage === item ? "default" : "ghost"}
                size="sm"
                className={`w-8 h-8 p-0 ${
                  currentPage === item
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
                onClick={() => {
                  if (typeof item === "number") {
                    setCurrentPage(item);
                  }
                }}
                disabled={typeof item !== "number"}
              >
                {item}
              </Button>
            ))}

          {!hasData &&
            [1, 2, 3, "...", 8, 9, 10].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-gray-400"
                disabled
              >
                {item}
              </Button>
            ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 flex items-center gap-1"
          disabled={!hasData || currentPage === totalPages}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
