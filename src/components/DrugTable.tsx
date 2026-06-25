"use client";
import { useState, useRef, useEffect } from "react";
import { Drug } from "@/lib/types";

interface Props {
  drugs: Drug[];
  onChange: (drugs: Drug[]) => void;
}

interface SearchResult {
  itemName: string;
  entpName: string;
  efcyQesitm: string;
  useMethodQesitm: string;
}

export default function DrugTable({ drugs, onChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "ingredient">("name");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const searchDrug = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search-drug?query=${encodeURIComponent(query)}&searchBy=${searchBy}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchDrug(value), 500);
  };

  const addFromSearch = (result: SearchResult) => {
    onChange([
      ...drugs,
      {
        id: crypto.randomUUID(),
        name: result.itemName,
        ingredient: "",
        dosage: "",
        frequency: result.useMethodQesitm?.slice(0, 50) || "",
        duration: "",
      },
    ]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-semibold">약물 리스트 ({drugs.length}개)</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
          >
            🔍 약물 검색
          </button>
          <button onClick={addDrug} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
            + 수동 추가
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-2 mb-2">
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as "name" | "ingredient")}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="name">약품명으로 검색</option>
              <option value="ingredient">성분명으로 검색</option>
            </select>
            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder={searchBy === "name" ? "약품명 입력 (예: 타이레놀)" : "성분명 입력 (예: 아세트아미노펜)"}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
          </div>
          {searching && <p className="text-sm text-blue-600 animate-pulse">검색 중...</p>}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border rounded">
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => addFromSearch(r)}
                >
                  <div>
                    <p className="text-sm font-medium">{r.itemName}</p>
                    <p className="text-xs text-gray-500">{r.entpName}</p>
                  </div>
                  <span className="text-xs text-blue-600">+ 추가</span>
                </div>
              ))}
            </div>
          )}
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-sm text-gray-400">검색 결과 없음</p>
          )}
        </div>
      )}

      {drugs.length === 0 ? (
        <p className="text-gray-400 text-center py-8">처방전을 업로드하거나 약물을 검색/추가하세요</p>
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
                    <input className="w-full border rounded px-2 py-1" value={drug.name}
                      onChange={(e) => updateDrug(drug.id, "name", e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <input className="w-full border rounded px-2 py-1" value={drug.ingredient}
                      onChange={(e) => updateDrug(drug.id, "ingredient", e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <input className="w-full border rounded px-2 py-1" value={drug.dosage}
                      onChange={(e) => updateDrug(drug.id, "dosage", e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <input className="w-full border rounded px-2 py-1" value={drug.frequency}
                      onChange={(e) => updateDrug(drug.id, "frequency", e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <input className="w-full border rounded px-2 py-1" value={drug.duration}
                      onChange={(e) => updateDrug(drug.id, "duration", e.target.value)} />
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
