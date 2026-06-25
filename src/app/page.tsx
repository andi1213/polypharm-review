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
    age: 0,
    gender: "male",
    symptoms: "",
    conditions: "",
  });
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{
    professional: string;
    patient: string;
    beers: any[];
    stopp: any[];
    start: any[];
    fdaSummaries: any[];
  } | null>(null);

  const handleExtracted = (extracted: Drug[]) => {
    setDrugs((prev) => [...prev, ...extracted]);
  };

  const runReview = async () => {
    if (drugs.length === 0) {
      alert("약물을 1개 이상 입력해주세요.");
      return;
    }
    setReviewing(true);
    setResult(null);

    try {
      // Step 1: 각 성분별 OpenFDA 조회
      setProgress("성분별 FDA 데이터 조회 중...");
      const ingredients = drugs
        .map((d) => d.ingredient || d.name)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);

      const fdaPromises = ingredients.map((ingredient) =>
        fetch("/api/ingredient-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredient }),
        }).then((r) => r.json()).catch(() => null)
      );
      const fdaSummaries = (await Promise.all(fdaPromises)).filter(Boolean);

      // Step 2: 종합 리포트 생성
      setProgress("Beers/STOPP/START 검토 + 종합 리포트 생성 중...");
      const reviewRes = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient, drugs, fdaSummaries }),
      });
      const reviewData = await reviewRes.json();

      setResult({
        professional: reviewData.professionalReport,
        patient: reviewData.patientReport,
        beers: reviewData.beers || [],
        stopp: reviewData.stopp || [],
        start: reviewData.start || [],
        fdaSummaries,
      });

      const review: ReviewResult = {
        id: uuidv4(),
        date: new Date().toISOString(),
        patient,
        drugs,
        professionalReport: reviewData.professionalReport,
        patientReport: reviewData.patientReport,
      };
      saveReview(review);
    } catch {
      alert("검토 중 오류가 발생했습니다.");
    } finally {
      setReviewing(false);
      setProgress("");
    }
  };

  return (
    <div className="space-y-6">
      <PatientForm patient={patient} onChange={setPatient} />
      <PrescriptionUpload onExtracted={handleExtracted} />
      <DrugTable drugs={drugs} onChange={setDrugs} />

      <div className="flex flex-col items-center gap-2 no-print">
        <button
          onClick={runReview}
          disabled={reviewing}
          className="bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reviewing ? "검토 중..." : "다제약물 검토 실행"}
        </button>
        {progress && <p className="text-sm text-blue-600 animate-pulse">{progress}</p>}
      </div>

      {result && (
        <ReviewReport
          professionalReport={result.professional}
          patientReport={result.patient}
          beers={result.beers}
          stopp={result.stopp}
          start={result.start}
          fdaSummaries={result.fdaSummaries}
        />
      )}
    </div>
  );
}
