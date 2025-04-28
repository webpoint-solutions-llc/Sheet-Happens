"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";

export default function GetCsvPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [csvText, setCsvText] = useState<string>(""); // Raw CSV text
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [csvData, setCsvData] = useState<any[]>([]); // Parsed CSV data (Array of objects)
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    async function fetchCsv() {
      try {
        const res = await fetch(
          "http://10.10.1.211:8080/csv/1725815494_6448_log"
        );

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const text = await res.text();
        console.log("CSV Text:", text);

        setCsvText(text);

        const parsedData = Papa.parse(text, { header: true }).data;
        console.log("Parsed CSV Data:", parsedData);
        setCsvData(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch CSV:", error);
        setIsLoading(false);
      }
    }

    fetchCsv();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    field: string
  ) => {
    const newData = [...csvData];
    newData[rowIndex][field] = e.target.value;
    setCsvData(newData);
  };

  // Handle CSV file import from local file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);

      const parsedData = Papa.parse(text, { header: true }).data;
      console.log("Parsed CSV from File:", parsedData);
      setCsvData(parsedData);
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Get date from timestamp for display
  const getFormattedDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return `Nov ${date.getDate()}`; // Simplified to match screenshot format
  };

  // Pagination
  const totalPages = Math.ceil(csvData.length / rowsPerPage);
  const paginatedData = csvData.slice(
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, User</h1>
            <p className="text-gray-500 text-sm">
              Track, manage and forecast your Worklogs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5 text-gray-500" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="/placeholder.svg?height=40&width=40"
                alt="User"
              />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 p-6 flex-grow">
        {/* Left Side - Worksheet */}
        <Card className="flex-1">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-700">
                Worksheet
              </CardTitle>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-sm text-black bg-white-600 px-4 py-2 rounded border border-gray-300"
                >
                  Import CSV
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 font-medium text-gray-500">
                        Time
                      </th>
                      <th className="py-3 px-4 font-medium text-gray-500">
                        Name
                      </th>
                      <th className="py-3 px-4 font-medium text-gray-500">
                        Description/Log
                      </th>
                      <th className="py-3 px-4 font-medium text-gray-500">
                        Time Stamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, rowIndex) => {
                      if (!row.Date && Object.keys(row).length <= 1)
                        return null; // Skip empty rows

                      const actualIndex =
                        rowIndex + (currentPage - 1) * rowsPerPage;
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
                              onChange={(e) =>
                                handleInputChange(e, actualIndex, "Date")
                              }
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
                              value={row.Description || ""}
                              onChange={(e) =>
                                handleInputChange(e, actualIndex, "Description")
                              }
                            />
                          </td>
                          <td className="py-4 px-4 align-top">
                            <Input
                              className="border-none shadow-none focus-visible:ring-0 p-0 h-auto text-gray-700 w-16 text-center"
                              type="text"
                              value={
                                row.TimeStamp ||
                                (rowIndex % 2 === 0
                                  ? "4h"
                                  : rowIndex % 3 === 0
                                  ? "3h"
                                  : "2h")
                              }
                              onChange={(e) =>
                                handleInputChange(e, actualIndex, "TimeStamp")
                              }
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
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side - Sheet It Out */}
        <Card className="w-[350px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-gray-700">
              Sheet It Out
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Emails, Comma Separated"
              className="border border-gray-300 text-sm"
            />
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
              + Add Recipient
            </Button>

            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Added Recipients
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  {
                    name: "Olivia Rhye",
                    email: "olivia@untitledui.com",
                    selected: true,
                  },
                  { name: "Wade Warren", email: "michael.mitc@example.com" },
                  {
                    name: "Kristin Watson",
                    email: "michelle.rivera@example.com",
                  },
                  { name: "Esther Howard", email: "kenzi.lawson@example.com" },
                  { name: "Albert Flores", email: "tim.jennings@example.com" },
                ].map((recipient, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`/placeholder.svg?height=32&width=32&text=${recipient.name.charAt(
                          0
                        )}`}
                        alt={recipient.name}
                      />
                      <AvatarFallback>
                        {recipient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700 text-sm">
                        {recipient.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {recipient.email}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">
                        Default
                      </span>
                      <Checkbox defaultChecked={recipient.selected} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
