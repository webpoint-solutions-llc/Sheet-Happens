"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import DataTable from "@/components/data-table";
import EmptyWorksheet from "@/components/empty-worksheet";
import Recipient from "@/components/recipient";

interface GetCsvPageProps {
  id?: string;
}

export default function GetCsvPage({
  id = "1725815494_6448_log",
}: GetCsvPageProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [csvText, setCsvText] = useState<string>(""); // Raw CSV text
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [csvData, setCsvData] = useState<any[]>([]); // Parsed CSV data (Array of objects)
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Get the user name from localStorage when component mounts
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setUserName(storedToken);
      }
    }

    async function fetchCsv() {
      try {
        // Use the dynamic ID from props in the API URL
        const res = await fetch(`http://10.10.1.211:8080/csv/${id}`);

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
        setCsvData([]); // Ensure empty array on error
      }
    }

    fetchCsv();
  }, [id]); // Re-fetch when ID changes

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

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);

      // Parse the CSV data
      let parsedData = Papa.parse(text, { header: true }).data;
      console.log("Parsed CSV from File:", parsedData);

      // Filter out empty rows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parsedData = parsedData.filter((row: any) =>
        Object.values(row).some((value) => value !== "")
      );

      // Map the CSV columns to our required fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parsedData = parsedData.map((row: any) => {
        // Check which format the CSV is in and map accordingly
        if (row["Commit Hash"] !== undefined) {
          // Format from the user's example
          return {
            Date: row.Date || "",
            "Author Name": row.Author || "",
            "Commit Type": row["Commit Type"] || "",
            Scope: row.Scope || "",
            Description: row.Message || "",
            TimeStamp: "", // Empty by default for user input
          };
        } else if (row.Date !== undefined) {
          // Format from the API
          return {
            Date: row.Date || "",
            "Author Name": row["Author Name"] || "",
            "Commit Type": row["Commit Type"] || "",
            Scope: row.Scope || "",
            Description: row.Description || "",
            TimeStamp: "", // Empty by default for user input
          };
        } else {
          // Try to guess the mapping based on available fields
          const dateField =
            Object.keys(row).find(
              (key) =>
                key.toLowerCase().includes("date") ||
                key.toLowerCase().includes("time")
            ) || "";

          const authorField =
            Object.keys(row).find(
              (key) =>
                key.toLowerCase().includes("author") ||
                key.toLowerCase().includes("name")
            ) || "";

          const commitTypeField =
            Object.keys(row).find(
              (key) =>
                key.toLowerCase().includes("commit type") ||
                key.toLowerCase().includes("type")
            ) || "";

          const scopeField =
            Object.keys(row).find((key) =>
              key.toLowerCase().includes("scope")
            ) || "";

          const descriptionField =
            Object.keys(row).find(
              (key) =>
                key.toLowerCase().includes("message") ||
                key.toLowerCase().includes("description") ||
                key.toLowerCase().includes("log")
            ) || "";

          return {
            Date: row[dateField] || "",
            "Author Name": row[authorField] || "",
            "Commit Type": row[commitTypeField] || "",
            Scope: row[scopeField] || "",
            Description: row[descriptionField] || "",
            TimeStamp: "", // Empty by default for user input
          };
        }
      });

      setCsvData(parsedData);
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Determine if we have data to display
  const hasData = csvData.length > 0 && !isLoading;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {userName}
            </h1>
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
              {hasData && (
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-sm text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded"
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
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : hasData ? (
              <DataTable
                data={csvData}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                handleInputChange={handleInputChange}
              />
            ) : (
              <EmptyWorksheet onImport={handleFileUpload} />
            )}
          </CardContent>
        </Card>

        {/* Right Side - Sheet It Out */}
        <Recipient csvData={csvData} />
      </div>
    </div>
  );
}
