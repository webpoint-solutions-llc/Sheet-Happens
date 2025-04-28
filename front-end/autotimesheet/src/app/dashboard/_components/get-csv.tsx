"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function GetCsvPage() {
  const [csvText, setCsvText] = useState<string>(""); // Raw CSV text
  const [csvData, setCsvData] = useState<any[]>([]); // Parsed CSV data (2D array)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCsv() {
      try {
        const res = await fetch(
          "http://10.10.1.211:8080/csv/1725815494_6448_log",
        );

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const text = await res.text();
        console.log("CSV Text:", text); // Log for debugging

        setCsvText(text); // Set the raw CSV text

        // Parse CSV text into a 2D array
        const parsedData = Papa.parse(text, { header: true }).data;
        console.log("Parsed CSV Data:", parsedData); // Log parsed data to verify
        setCsvData(parsedData); // Set parsed data to state
        setIsLoading(false); // Stop loading state
      } catch (error) {
        console.error("Failed to fetch CSV:", error);
        setIsLoading(false);
      }
    }

    fetchCsv();
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number,
  ) => {
    const newData = [...csvData];
    newData[rowIndex][colIndex] = e.target.value;
    setCsvData(newData);
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                {csvData[0] &&
                  Object.keys(csvData[0]).map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((cell, colIndex) => (
                    <td key={colIndex}>
                      <input
                        type="text"
                        value={cell} // Bind to correct value
                        onChange={(e) =>
                          handleInputChange(e, rowIndex, colIndex)
                        } // Update state
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
