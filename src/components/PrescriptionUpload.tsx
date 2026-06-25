"use client";
import { useState } from "react";
import { Drug } from "@/lib/types";

interface Props {
  onExtracted: (drugs: Drug[]) => void;
}

export default function PrescriptionUpload({ onExtracted }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type as any;

      setLoading(true);
      try {
        const res = await fetch("/api/extract-drugs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mediaType }),
        });
        const data = await res.json();
        const drugs: Drug[] = (data.drugs || []).map((d: any, i: number) => ({
          id: crypto.randomUUID(),
          name: d.name || "",
          ingredient: d.ingredient || "",
          dosage: d.dosage || "",
          frequency: d.frequency || "",
          duration: d.duration || "",
        }));
        onExtracted(drugs);
      } catch (err) {
        alert("처방전 분석 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">처방전 업로드</h2>
      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition">
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {loading ? (
          <p className="text-blue-600 animate-pulse">처방전 분석 중...</p>
        ) : preview ? (
          <img src={preview} alt="처방전" className="max-h-48 mx-auto" />
        ) : (
          <p className="text-gray-500">처방전 이미지를 클릭하여 업로드<br/>(JPG, PNG)</p>
        )}
      </label>
    </div>
  );
}
