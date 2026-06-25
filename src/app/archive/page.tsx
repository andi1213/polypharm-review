"use client";
import { useEffect, useState } from "react";
import { ReviewResult } from "@/lib/types";
import { getReviews, deleteReview } from "@/lib/store";
import ReviewReport from "@/components/ReviewReport";

export default function ArchivePage() {
  const [reviews, setReviews] = useState<ReviewResult[]>([]);
  const [selected, setSelected] = useState<ReviewResult | null>(null);

  useEffect(() => {
    setReviews(getReviews());
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    deleteReview(id);
    setReviews(getReviews());
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">검토 기록</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-12">저장된 검토 기록이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:ring-2 hover:ring-blue-300 ${
                  selected?.id === r.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelected(r)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{r.patient.name || "이름 없음"}</p>
                    <p className="text-sm text-gray-500">
                      {r.patient.age}세 / {r.drugs.length}개 약물
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.date).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            {selected ? (
              <ReviewReport
                professionalReport={selected.professionalReport}
                patientReport={selected.patientReport}
              />
            ) : (
              <p className="text-gray-400 text-center py-12">검토 기록을 선택하세요</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
