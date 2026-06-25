"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import PatientForm from "@/components/PatientForm";
import PrescriptionUpload from "@/components/PrescriptionUpload";
import DrugTable from "@/components/DrugTable";
import ReviewReport from "@/components/ReviewReport";
import { PatientInfo, Drug, ReviewResult } from "@/lib/types";
import { saveReview } from "@/lib/store";

interface AlertData {
  beers: any[];
  stopp: any[];
  start: any[];
}

export default function Home() {
  const [patient, setPatient] = useState<PatientInfo>({
    age: 0,
    gender: "male",
    symptoms: "",
    conditions: "",
  });
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<{ professional: string; patient: string } | null>(null);
  const [alerts, setAlerts] = useState<AlertData | null>(null);

  const handleExtracted = (extracted: Drug[]) => {
    setDrugs((prev) => [...prev, ...extracted]);
  };

  const runReview = async () => {
    if (drugs.length === 0) {
      alert("약물을 1개 이상 입력해주세요.");
      return;
    }
    setReviewing(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient, drugs }),
      });
      const data = await res.json();
      setResult({ professional: data.professionalReport, patient: data.patientReport });
      setAlerts({ beers: data.beers || [], stopp: data.stopp || [], start: data.start || [] });

      const review: ReviewResult = {
        id: uuidv4(),
        date: new Date().toISOString(),
        patient,
        drugs,
        professionalReport: data.professionalReport,
        patientReport: data.patientReport,
      };
      saveReview(review);
    } catch {
      alert("검토 중 오류가 발생했습니다.");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PatientForm patient={patient} onChange={setPatient} />
      <PrescriptionUpload onExtracted={handleExtracted} />
      <DrugTable drugs={drugs} onChange={setDrugs} />

      <div className="flex justify-center no-print">
        <button
          onClick={runReview}
          disabled={reviewing}
          className="bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reviewing ? "검토 중..." : "다제약물 검토 실행"}
        </button>
      </div>

      {alerts && (alerts.beers.length > 0 || alerts.stopp.length > 0 || alerts.start.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">✓ 검증됨</span> 내장 룰셋/FDA 라벨 기반
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">AI 참고의견</span> GPT 분석 (전문가 확인 필요)
          </div>
          {alerts.beers.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Beers Criteria 해당 약물 ({alerts.beers.length}건) <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-normal ml-2">✓ 검증됨 — AGS 2023</span></h3>
              {alerts.beers.map((b: any, i: number) => (
                <div key={i} className="text-sm mb-2 text-red-700">
                  <span className="font-medium">{b.drugKo}</span> ({b.category})
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${b.severity === "high" ? "bg-red-200" : "bg-yellow-200"}`}>
                    {b.severity === "high" ? "고위험" : "중등도"}
                  </span>
                  <p className="text-xs mt-0.5">{b.reason}</p>
                  <p className="text-xs text-red-600">→ {b.recommendation}</p>
                </div>
              ))}
            </div>
          )}
          {alerts.stopp.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">🛑 STOPP Criteria 해당 ({alerts.stopp.length}건) <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-normal ml-2">✓ 검증됨 — STOPP/START v2</span></h3>
              {alerts.stopp.map((s: any, i: number) => (
                <div key={i} className="text-sm mb-2 text-orange-700">
                  <span className="font-medium">[{s.id}] {s.drugsKo.join(", ")}</span> — {s.section}
                  <p className="text-xs mt-0.5">{s.reason}</p>
                </div>
              ))}
            </div>
          )}
          {alerts.start.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ START Criteria — 추가 고려 약물 ({alerts.start.length}건) <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-normal ml-2">✓ 검증됨</span></h3>
              {alerts.start.map((s: any, i: number) => (
                <div key={i} className="text-sm mb-2 text-green-700">
                  <span className="font-medium">{s.drugsKo.join(", ")}</span> — {s.condition}
                  <p className="text-xs mt-0.5">{s.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result && (
        <ReviewReport professionalReport={result.professional} patientReport={result.patient} />
      )}
    </div>
  );
}
