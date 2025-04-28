"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function GetCsvPage() {
  const [csvText, setCsvText] = useState<string>(""); // Raw CSV text
  const [csvData, setCsvData] = useState<any[]>([]); // Parsed CSV data (Array of objects)
  const [isLoading, setIsLoading] = useState(true);

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
    colIndex: number
  ) => {
    const newData = [...csvData];
    const key = Object.keys(newData[rowIndex])[colIndex];
    newData[rowIndex][key] = e.target.value;
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">
      {/* Top Welcome Message */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, Anuj</h1>
        <p className="text-gray-500 text-sm">
          Track, manage and forecast your Worklogs.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 flex-grow">
        {/* Left Side - Worksheet */}
        <div className="flex-1 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Worksheet</h2>
            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
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
              <button className="text-blue-600 text-sm font-medium hover:underline">
                Edit
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-b">
                  <tr>
                    {csvData[0] &&
                      Object.keys(csvData[0]).map((header, index) => (
                        <th key={index} className="py-3 px-4 font-semibold">
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-gray-50">
                      {Object.values(row).map((cell, colIndex) => (
                        <td key={colIndex} className="py-3 px-4">
                          <input
                            className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                            type="text"
                            value={cell as string}
                            onChange={(e) =>
                              handleInputChange(e, rowIndex, colIndex)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination (Dummy for now) */}
              <div className="flex justify-between items-center mt-4">
                <button className="text-sm text-gray-500 flex items-center gap-1">
                  ← Previous
                </button>
                <div className="flex gap-2">
                  {[1, 2, 3, "...", 8, 9, 10].map((item, index) => (
                    <button
                      key={index}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 rounded hover:bg-gray-200"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button className="text-sm text-gray-500 flex items-center gap-1">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Sheet It Out */}
        <div className="w-[350px] bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Sheet It Out
          </h2>
          <input
            type="text"
            placeholder="Emails, Comma Separated"
            className="border border-gray-300 rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button className="w-full bg-black text-white py-2 rounded mb-6 hover:bg-gray-900">
            + Add Recipient
          </button>

          {/* Added Recipients (Dummy Static for now) */}
          <div className="flex flex-col gap-4">
            {[
              {
                name: "Olivia Rhye",
                email: "olivia@untitledui.com",
                selected: true,
              },
              { name: "Wade Warren", email: "michael.mitc@example.com" },
              { name: "Kristin Watson", email: "michelle.rivera@example.com" },
              { name: "Esther Howard", email: "kenzi.lawson@example.com" },
              { name: "Albert Flores", email: "tim.jennings@example.com" },
            ].map((recipient, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="font-medium text-gray-700 text-sm">
                    {recipient.name}
                  </div>
                  <div className="text-gray-400 text-xs">{recipient.email}</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={recipient.selected}
                  className="h-4 w-4"
                />
              </div>
            ))}
          </div>

          <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-6">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
