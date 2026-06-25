"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import PatientForm from "@/components/PatientForm";
import PrescriptionUpload from "@/components/PrescriptionUpload";
import DrugTable from "@/components/DrugTable";
import ReviewReport from "@/components/ReviewReport";
import { PatientInfo, Drug, ReviewResult } from "@/lib/types";
import { saveReview } from "@/lib/store";

export default function Home() {
  const [patient, setPatient] = useState<PatientInfo>({
    name: "",
    age: 0,
    gender: "male",
    symptoms: "",
    conditions: "",
  });
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<{ professional: string; patient: string } | null>(null);

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

      {result && (
        <ReviewReport professionalReport={result.professional} patientReport={result.patient} />
      )}
    </div>
  );
}
