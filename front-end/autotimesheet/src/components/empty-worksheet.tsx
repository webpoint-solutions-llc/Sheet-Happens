import { FileText } from "lucide-react";

interface EmptyWorksheetProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EmptyWorksheet({ onImport }: EmptyWorksheetProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 mb-4 text-gray-300">
        <FileText className="w-full h-full" strokeWidth={1} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No files Found</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-6">
        Start by importing your data. Upload a CSV file to populate the table
        and get started.
      </p>
      <label
        htmlFor="file-upload-empty"
        className="cursor-pointer text-sm text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded"
      >
        Import CSV
      </label>
      <input
        id="file-upload-empty"
        type="file"
        accept=".csv"
        onChange={onImport}
        className="hidden"
      />
    </div>
  );
}
