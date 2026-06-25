"use client";
import { useState } from "react";

interface Props {
  professionalReport: string;
  patientReport: string;
}

export default function ReviewReport({ professionalReport, patientReport }: Props) {
  const [tab, setTab] = useState<"professional" | "patient">("professional");

  const printReport = () => window.print();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("professional")}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === "professional" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            전문가용 리포트
          </button>
          <button
            onClick={() => setTab("patient")}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === "patient" ? "bg-green-600 text-white" : "bg-gray-100"
            }`}
          >
            환자 상담용
          </button>
        </div>
        <button onClick={printReport} className="text-sm text-gray-500 hover:text-gray-700 no-print">
          🖨 인쇄
        </button>
      </div>
      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
        {tab === "professional" ? professionalReport : patientReport}
      </div>
    </div>
  );
}
