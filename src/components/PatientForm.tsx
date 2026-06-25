"use client";
import { PatientInfo } from "@/lib/types";

interface Props {
  patient: PatientInfo;
  onChange: (p: PatientInfo) => void;
}

export default function PatientForm({ patient, onChange }: Props) {
  const update = (field: keyof PatientInfo, value: string | number) =>
    onChange({ ...patient, [field]: value });

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">환자 정보</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">나이</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={patient.age || ""}
            onChange={(e) => update("age", parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">성별</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={patient.gender}
            onChange={(e) => update("gender", e.target.value)}
          >
            <option value="male">남</option>
            <option value="female">여</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">증상</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="주요 증상"
            value={patient.symptoms}
            onChange={(e) => update("symptoms", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">기저질환</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="고혈압, 당뇨 등"
            value={patient.conditions}
            onChange={(e) => update("conditions", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
