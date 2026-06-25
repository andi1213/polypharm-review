"use client";
import { useState, useRef } from "react";
import { Drug } from "@/lib/types";

interface Props {
  drugs: Drug[];
  onChange: (drugs: Drug[]) => void;
}

interface SearchResult {
  brandName: string;
  genericName: string;
  manufacturer: string;
  purpose: string;
  dosage: string;
  warnings: string;
}

export default function DrugTable({ drugs, onChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
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
      const res = await fetch(`/api/search-drug?query=${encodeURIComponent(query)}`);
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
    searchTimeout.current = setTimeout(() => searchDrug(value), 600);
  };

  const addFromSearch = (result: SearchResult) => {
    onChange([
      ...drugs,
      {
        id: crypto.randomUUID(),
        name: result.brandName,
        ingredient: result.genericName,
        dosage: "",
        frequency: result.dosage?.slice(0, 50) || "",
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
          <input
            className="w-full border rounded px-3 py-2 text-sm mb-2"
            placeholder="약품명 또는 성분명 입력 (한글/영문 모두 가능)"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
          {searching && <p className="text-sm text-blue-600 animate-pulse">검색 중... (OpenFDA 조회 + 한글 번역)</p>}
          {searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto border rounded bg-white">
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className="px-3 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => addFromSearch(r)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.brandName}</p>
                      <p className="text-xs text-gray-600">성분: {r.genericName}</p>
                      {r.purpose && <p className="text-xs text-gray-500 mt-1">효능: {r.purpose.slice(0, 80)}</p>}
                      {r.manufacturer && <p className="text-xs text-gray-400">{r.manufacturer}</p>}
                    </div>
                    <span className="text-xs text-blue-600 whitespace-nowrap ml-2">+ 추가</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-sm text-gray-400">검색 결과 없음 — 영문 약품명/성분명으로도 시도해보세요</p>
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
