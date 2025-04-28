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
    <div>
      <h2>CSV Viewer</h2>

      {/* Button to import CSV manually */}
      <div style={{ marginBottom: "20px" }}>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <table border={1} cellPadding={5}>
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
        </div>
      )}
    </div>
  );
}
