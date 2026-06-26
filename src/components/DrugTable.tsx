"use client";
import { useState, useRef } from "react";
import { Drug } from "@/lib/types";

interface Props {
  drugs: Drug[];
  onChange: (drugs: Drug[]) => void;
}

interface KoreanDrugResult {
  itemName: string;
  entpName: string;
  efcyQesitm: string;
  useMethodQesitm: string;
  atpnQesitm: string;
  intrcQesitm: string;
  seQesitm: string;
  itemImage: string;
}

export default function DrugTable({ drugs, onChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KoreanDrugResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchError, setSearchError] = useState("");
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
    setSearchError("");
    try {
      const res = await fetch(`/api/search-drug?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) setSearchError(data.error);
      setSearchResults(data.results || []);
    } catch {
      setSearchError("검색 중 오류 발생");
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

  const extractIngredient = (itemName: string): string => {
    const match = itemName.match(/\(([^)]+)\)/);
    if (match) return match[1];
    const parts = itemName.replace(/정|캡슐|시럽|주사|현탁액|과립|산|액|크림|연고|겔/g, "").trim();
    return parts;
  };

  const addFromSearch = (result: KoreanDrugResult) => {
    const dosageMatch = result.useMethodQesitm.match(/(\d+\s*(mg|g|ml|정|캡슐|포))/i);
    const freqMatch = result.useMethodQesitm.match(/(1일\s*\d+회[^.]*)/);

    onChange([
      ...drugs,
      {
        id: crypto.randomUUID(),
        name: result.itemName,
        ingredient: extractIngredient(result.itemName),
        dosage: dosageMatch?.[0] || "",
        frequency: freqMatch?.[0] || "",
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
            🔍 약물 검색 (약학정보원)
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
            placeholder="제품명 입력 (예: 타이레놀, 아스피린, 리피토)"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
          {searching && <p className="text-sm text-blue-600 animate-pulse">검색 중... (약학정보원 → 의약품안전나라 → AI 순서)</p>}
          {searchError && <p className="text-sm text-red-500">{searchError}</p>}
          {searchResults.length > 0 && (
            <div className="max-h-72 overflow-y-auto border rounded bg-white">
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className="px-3 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => addFromSearch(r)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {r.itemImage && (
                          <img src={r.itemImage} alt="" className="w-10 h-10 object-contain rounded" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{r.itemName}</p>
                          <p className="text-xs text-gray-500">
                            {r.entpName}
                            {(r as any).etcOtcCode && (
                              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${(r as any).etcOtcCode === "전문의약품" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                                {(r as any).etcOtcCode}
                              </span>
                            )}
                            {(r as any).source && (
                              <span className="ml-1 text-xs text-gray-400">[{(r as any).source}]</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {r.efcyQesitm && (
                        <p className="text-xs text-gray-600 mt-1">{r.efcyQesitm.slice(0, 100)}</p>
                      )}
                    </div>
                    <span className="text-xs text-blue-600 whitespace-nowrap ml-2">+ 추가</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!searching && !searchError && searchQuery.length >= 2 && searchResults.length === 0 && (
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
