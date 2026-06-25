"use client";
import { useState } from "react";

interface Props {
  professionalReport: string;
  patientReport: string;
  beers: any[];
  stopp: any[];
  start: any[];
  fdaSummaries: any[];
}

type Tab = "openfda" | "beers" | "stopp_start" | "report" | "patient";

export default function ReviewReport({ professionalReport, patientReport, beers, stopp, start, fdaSummaries }: Props) {
  const [tab, setTab] = useState<Tab>("openfda");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "openfda", label: "OpenFDA 정보", count: fdaSummaries.length },
    { key: "beers", label: "Beers Criteria", count: beers.length },
    { key: "stopp_start", label: "STOPP/START", count: stopp.length + start.length },
    { key: "report", label: "전체 분석 리포트" },
    { key: "patient", label: "환자 상담용" },
  ];

  const printReport = () => window.print();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-wrap gap-1 mb-4 border-b pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-t text-sm font-medium transition ${
              tab === t.key ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                tab === t.key ? "bg-blue-500" : t.count > 0 ? "bg-red-100 text-red-700" : "bg-gray-200"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
        <button onClick={printReport} className="ml-auto text-sm text-gray-500 hover:text-gray-700 no-print">
          🖨 인쇄
        </button>
      </div>

      {tab === "openfda" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">✓ 검증됨</span>
            <span className="text-xs text-gray-500">FDA 약물 라벨 데이터 기반 (한글 번역)</span>
          </div>
          {fdaSummaries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">OpenFDA에서 조회된 성분 정보가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {fdaSummaries.map((fda: any, i: number) => (
                <div key={i} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">{fda.ingredient} → {fda.englishName}</h4>
                  {fda.fda ? (
                    <div className="grid gap-2 text-sm">
                      {fda.fda.drugInteractions && (
                        <div><span className="font-medium text-gray-700">약물 상호작용:</span>
                          <p className="text-gray-600 mt-0.5">{fda.fda.drugInteractions}</p></div>
                      )}
                      {fda.fda.warnings && (
                        <div><span className="font-medium text-gray-700">경고:</span>
                          <p className="text-gray-600 mt-0.5">{fda.fda.warnings}</p></div>
                      )}
                      {fda.fda.contraindications && (
                        <div><span className="font-medium text-gray-700">금기:</span>
                          <p className="text-gray-600 mt-0.5">{fda.fda.contraindications}</p></div>
                      )}
                      {fda.fda.adverseReactions && (
                        <div><span className="font-medium text-gray-700">이상반응:</span>
                          <p className="text-gray-600 mt-0.5">{fda.fda.adverseReactions}</p></div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">FDA 데이터에서 해당 성분을 찾을 수 없습니다.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "beers" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">✓ 검증됨 — AGS 2023</span>
          </div>
          {beers.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Beers Criteria 해당 약물이 없습니다. (65세 미만이거나 해당 약물 없음)</p>
          ) : (
            <div className="space-y-3">
              {beers.map((b: any, i: number) => (
                <div key={i} className={`border rounded-lg p-4 ${b.severity === "high" ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{b.drugKo} ({b.drug})</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${b.severity === "high" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"}`}>
                      {b.severity === "high" ? "고위험" : "중등도"}
                    </span>
                    <span className="text-xs text-gray-500">{b.category}</span>
                  </div>
                  <p className="text-sm text-gray-700">사유: {b.reason}</p>
                  <p className="text-sm text-blue-700 mt-1">권고: {b.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "stopp_start" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">✓ 검증됨 — STOPP/START v2</span>
          </div>
          {stopp.length === 0 && start.length === 0 ? (
            <p className="text-gray-400 text-center py-8">STOPP/START 해당 항목이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {stopp.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">🛑 STOPP — 중단 고려 ({stopp.length}건)</h4>
                  {stopp.map((s: any, i: number) => (
                    <div key={i} className="border border-red-200 bg-red-50 rounded-lg p-3 mb-2">
                      <p className="text-sm font-medium">[{s.id}] {s.drugsKo.join(", ")} — {s.section}</p>
                      <p className="text-sm text-gray-700 mt-1">{s.reason}</p>
                      <p className="text-xs text-gray-500 mt-0.5">조건: {s.condition}</p>
                    </div>
                  ))}
                </div>
              )}
              {start.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">✅ START — 추가 고려 ({start.length}건)</h4>
                  {start.map((s: any, i: number) => (
                    <div key={i} className="border border-green-200 bg-green-50 rounded-lg p-3 mb-2">
                      <p className="text-sm font-medium">[{s.id}] {s.drugsKo.join(", ")} — {s.section}</p>
                      <p className="text-sm text-gray-700 mt-1">{s.condition} → {s.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "report" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">AI 참고의견</span>
            <span className="text-xs text-gray-400">검증 데이터 기반 GPT-4o 종합 분석</span>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            🟢 높음 = 검증 데이터 기반 &nbsp; 🟡 중간 = 일반 약학 지식 &nbsp; 🔴 낮음 = 추가 확인 필요
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap border-t pt-4">
            {professionalReport || "검토 결과가 없습니다."}
          </div>
        </div>
      )}

      {tab === "patient" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">환자용</span>
            <span className="text-xs text-gray-400">쉬운 언어로 작성된 상담 자료</span>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap border-t pt-4">
            {patientReport || "검토 결과가 없습니다."}
          </div>
        </div>
      )}

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
