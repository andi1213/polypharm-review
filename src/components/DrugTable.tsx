"use client";
import { useState } from "react";
import { Drug } from "@/lib/types";

interface Props {
  drugs: Drug[];
  onChange: (drugs: Drug[]) => void;
}

export default function DrugTable({ drugs, onChange }: Props) {
  const [searchLoading, setSearchLoading] = useState<string | null>(null);

  const addDrug = () => {
    onChange([
      ...drugs,
      { id: crypto.randomUUID(), name: "", ingredient: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const removeDrug = (id: string) => onChange(drugs.filter((d) => d.id !== id));

  const updateDrug = (id: string, field: keyof Drug, value: string) => {
    onChange(drugs.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const searchIngredient = async (drug: Drug) => {
    if (!drug.name) return;
    setSearchLoading(drug.id);
    try {
      const res = await fetch(`/api/search-drug?name=${encodeURIComponent(drug.name)}`);
      const data = await res.json();
      if (data.results?.length > 0) {
        const item = data.results[0];
        updateDrug(drug.id, "ingredient", item.itemName || item.entpName || "");
      }
    } catch {} finally {
      setSearchLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">약물 리스트 ({drugs.length}개)</h2>
        <button onClick={addDrug} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          + 약물 추가
        </button>
      </div>
      {drugs.length === 0 ? (
        <p className="text-gray-400 text-center py-8">처방전을 업로드하거나 약물을 수동 추가하세요</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">약품명</th>
                <th className="px-3 py-2 text-left">성분명</th>
                <th className="px-3 py-2 text-left">용량</th>
                <th className="px-3 py-2 text-left">투여횟수</th>
                <th className="px-3 py-2 text-left">기간</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((drug) => (
                <tr key={drug.id} className="border-t">
                  <td className="px-3 py-2">
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={drug.name}
                      onChange={(e) => updateDrug(drug.id, "name", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <input
                        className="w-full border rounded px-2 py-1"
                        value={drug.ingredient}
                        onChange={(e) => updateDrug(drug.id, "ingredient", e.target.value)}
                      />
                      <button
                        onClick={() => searchIngredient(drug)}
                        className="text-xs bg-gray-100 px-2 rounded hover:bg-gray-200 whitespace-nowrap"
                        disabled={searchLoading === drug.id}
                      >
                        {searchLoading === drug.id ? "..." : "조회"}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={drug.dosage}
                      onChange={(e) => updateDrug(drug.id, "dosage", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={drug.frequency}
                      onChange={(e) => updateDrug(drug.id, "frequency", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={drug.duration}
                      onChange={(e) => updateDrug(drug.id, "duration", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeDrug(drug.id)} className="text-red-500 hover:text-red-700">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
