"use client";
import { useState } from "react";
import { Drug } from "@/lib/types";

interface Props {
  onExtracted: (drugs: Drug[]) => void;
}

interface UploadedImage {
  id: string;
  preview: string;
  status: "pending" | "processing" | "done" | "error";
  drugCount?: number;
}

export default function PrescriptionUpload({ onExtracted }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const processImage = async (file: File, imgId: string) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type;

      setImages((prev) =>
        prev.map((img) => (img.id === imgId ? { ...img, preview: dataUrl, status: "processing" as const } : img))
      );

      try {
        const res = await fetch("/api/extract-drugs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mediaType }),
        });
        const data = await res.json();
        const drugs: Drug[] = (data.drugs || []).map((d: any) => ({
          id: crypto.randomUUID(),
          name: d.name || "",
          ingredient: d.ingredient || "",
          dosage: d.dosage || "",
          frequency: d.frequency || "",
          duration: d.duration || "",
        }));
        onExtracted(drugs);
        setImages((prev) =>
          prev.map((img) => (img.id === imgId ? { ...img, status: "done" as const, drugCount: drugs.length } : img))
        );
      } catch {
        setImages((prev) =>
          prev.map((img) => (img.id === imgId ? { ...img, status: "error" as const } : img))
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const id = crypto.randomUUID();
      setImages((prev) => [...prev, { id, preview: "", status: "pending" }]);
      processImage(file, id);
    });
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">처방전 / 약봉투 업로드</h2>
      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition">
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        <p className="text-gray-500">클릭하여 이미지 업로드 (여러 장 가능)<br />처방전, 약봉투, 약 설명서 등</p>
      </label>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative border rounded-lg overflow-hidden">
              {img.preview && (
                <img src={img.preview} alt="업로드 이미지" className="w-full h-32 object-cover" />
              )}
              <div className="p-2 text-xs text-center">
                {img.status === "processing" && <span className="text-blue-600 animate-pulse">분석 중...</span>}
                {img.status === "done" && <span className="text-green-600">{img.drugCount}개 약물 추출</span>}
                {img.status === "error" && <span className="text-red-600">분석 실패</span>}
              </div>
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
