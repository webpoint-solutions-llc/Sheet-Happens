import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    field: string
  ) => void;
}

export default function DataTable({
  data,
  currentPage,
  setCurrentPage,
  handleInputChange,
}: DataTableProps) {
  const rowsPerPage = 8;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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

  // Get date from timestamp for display
  const getFormattedDate = (dateString: string) => {
    if (!dateString) return "";

    // Try to parse the date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // If it's a valid date, format it as "Nov 13" (or whatever month it is)
      const month = date.toLocaleString("default", { month: "short" });
      return `${month} ${date.getDate()}`;
    }

    // If it's not a valid date object but has a specific format like "4/28/2025"
    if (dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const month = new Date(
          Number.parseInt(parts[2]),
          Number.parseInt(parts[0]) - 1,
          1
        ).toLocaleString("default", {
          month: "short",
        });
        return `${month} ${parts[1]}`;
      }
    }

    // If all else fails, just return the original string
    return dateString;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 font-medium text-gray-500">Time</th>
            <th className="py-3 px-4 font-medium text-gray-500">Name</th>
            <th className="py-3 px-4 font-medium text-gray-500">Commit Type</th>
            <th className="py-3 px-4 font-medium text-gray-500">Scope</th>
            <th className="py-3 px-4 font-medium text-gray-500">
              Description/Log
            </th>
            <th className="py-3 px-4 font-medium text-gray-500">Time Stamp</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, rowIndex) => {
            if (
              Object.keys(row).length <= 1 &&
              !Object.values(row).some((val) => val)
            )
              return null; // Skip empty rows

            const actualIndex = rowIndex + (currentPage - 1) * rowsPerPage;
            return (
              <tr
                key={rowIndex}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4 align-top">
                  <Input
                    className="border-none shadow-none focus-visible:ring-0 p-0 h-auto text-gray-700"
                    type="text"
                    value={getFormattedDate(row.Date)}
                    onChange={(e) => handleInputChange(e, actualIndex, "Date")}
                  />
                </td>
                <td className="py-4 px-4 align-top">
                  <Input
                    className="border-none shadow-none focus-visible:ring-0 p-0 h-auto text-gray-700 font-medium"
                    type="text"
                    value={row["Author Name"] || ""}
                    onChange={(e) =>
                      handleInputChange(e, actualIndex, "Author Name")
                    }
                  />
                </td>
                <td className="py-4 px-4 align-top">
                  <Input
                    className="border-none shadow-none focus-visible:ring-0 p-0 h-auto text-gray-700"
                    type="text"
                    value={row["Commit Type"] || ""}
                    onChange={(e) =>
                      handleInputChange(e, actualIndex, "Commit Type")
                    }
                  />
                </td>
                <td className="py-4 px-4 align-top">
                  <Input
                    className="border-none shadow-none focus-visible:ring-0 p-0 h-auto text-gray-700"
                    type="text"
                    value={row.Scope || ""}
                    onChange={(e) => handleInputChange(e, actualIndex, "Scope")}
                  />
                </td>
                <td className="py-4 px-4 align-top">
                  <Input
                    className="border-none shadow-none focus-visible:ring-0 p-0 h-auto text-gray-700"
                    type="text"
                    value={row.Description || row.Message || ""}
                    onChange={(e) =>
                      handleInputChange(
                        e,
                        actualIndex,
                        row.Description !== undefined
                          ? "Description"
                          : "Message"
                      )
                    }
                  />
                </td>
                <td className="py-4 px-4 align-top">
                  <Input
                    className="border border-gray-400 rounded-none focus-visible:ring-0 p-0 h-auto text-gray-700 w-16 text-center"
                    type="text"
                    value={row.TimeStamp || ""}
                    onChange={(e) =>
                      handleInputChange(e, actualIndex, "TimeStamp")
                    }
                    placeholder=""
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 flex items-center gap-1"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <div className="flex gap-1">
          {generatePaginationNumbers().map((item, index) => (
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
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 flex items-center gap-1"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
