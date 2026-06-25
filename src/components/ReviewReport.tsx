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

      <div className="mb-3 flex items-center gap-2">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">AI 참고의견</span>
        <span className="text-xs text-gray-400">아래 리포트는 GPT-4o가 검증된 데이터를 기반으로 생성한 분석입니다</span>
      </div>
      <div className="text-xs text-gray-400 mb-3">
        🟢 높음 = 검증 데이터 기반 &nbsp; 🟡 중간 = 일반 약학 지식 &nbsp; 🔴 낮음 = 추가 확인 필요
      </div>

      <div className="prose prose-sm max-w-none whitespace-pre-wrap border-t pt-4">
        {tab === "professional" ? professionalReport : patientReport}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p className="font-semibold mb-1">⚠️ 의료 면책 고지</p>
        <p>
          이 리포트는 AI 기반 참고자료이며, 의료 행위나 처방을 대체하지 않습니다.
          Beers Criteria(AGS 2023), STOPP/START v2(2015), FDA 약물 라벨 데이터를 기반으로 생성되었으나,
          개별 환자의 임상 상황에 따라 다를 수 있습니다.
          최종 판단은 반드시 담당 의사·약사와 상의하세요.
        </p>
      </div>
    </div>
  );
}
