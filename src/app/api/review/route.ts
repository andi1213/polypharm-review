import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkBeers, checkStoppStart } from "@/lib/beers-criteria";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function fetchFDAInteractions(drugNames: string[]) {
  const interactions: any[] = [];
  for (const name of drugNames.slice(0, 10)) {
    try {
      const res = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`
      );
      if (!res.ok) continue;
      const data = await res.json();
      const label = data.results?.[0];
      if (label) {
        interactions.push({
          drug: name,
          interactions: label.drug_interactions?.[0]?.slice(0, 500) || "",
          warnings: label.warnings?.[0]?.slice(0, 500) || "",
          contraindications: label.contraindications?.[0]?.slice(0, 300) || "",
        });
      }
    } catch {}
  }
  return interactions;
}

export async function POST(req: NextRequest) {
  const { patient, drugs } = await req.json();

  const drugNames = drugs.map((d: any) => (d.ingredient || d.name).trim()).filter(Boolean);
  const beersResults = patient.age >= 65 ? checkBeers(drugNames.concat(drugs.map((d: any) => d.name))) : [];
  const allNames = drugs.map((d: any) => `${d.name} ${d.ingredient}`.trim());
  const stoppStartResults = checkStoppStart(allNames, patient.conditions || "");
  const stoppResults = stoppStartResults.filter((r) => r.action === "STOPP");
  const startResults = stoppStartResults.filter((r) => r.action === "START");

  const fdaData = await fetchFDAInteractions(drugNames);

  const drugList = drugs
    .map((d: any, i: number) => `${i + 1}. ${d.name} (${d.ingredient}) - ${d.dosage}, ${d.frequency}, ${d.duration}`)
    .join("\n");

  const beersSection = beersResults.length > 0
    ? `\n## [검증됨] Beers Criteria 해당 약물 (AGS 2023 기준)\n${beersResults.map((b) => `- ${b.drugKo}(${b.drug}): ${b.reason} → ${b.recommendation} [심각도: ${b.severity}]`).join("\n")}`
    : "\n## [검증됨] Beers Criteria: 내장 룰셋 기준 해당 약물 없음";

  const stoppSection = stoppResults.length > 0
    ? `\n## [검증됨] STOPP Criteria 해당 (STOPP/START v2, 2015)\n${stoppResults.map((s) => `- [${s.id}] ${s.drugsKo.join(", ")}: ${s.reason}`).join("\n")}`
    : "";

  const startSection = startResults.length > 0
    ? `\n## [검증됨] START Criteria 추가 고려 약물\n${startResults.map((s) => `- [${s.id}] ${s.drugsKo.join(", ")}: ${s.condition} → ${s.reason}`).join("\n")}`
    : "";

  const fdaSection = fdaData.length > 0
    ? `\n## [검증됨] FDA 약물 라벨 정보 (원문 발췌)\n${fdaData.map((f) => `### ${f.drug}\n- 상호작용: ${f.interactions || "정보 없음"}\n- 경고: ${f.warnings || "정보 없음"}\n- 금기: ${f.contraindications || "정보 없음"}`).join("\n\n")}`
    : "";

  const prompt = `당신은 노인약학 전문 임상약사입니다.

## 중요 규칙 — 반드시 지키세요
1. 아래 제공된 데이터([검증됨] 표시)만을 근거로 분석하세요.
2. 제공된 데이터에 없는 약물 상호작용이나 부작용을 지어내지 마세요.
3. 확실하지 않은 정보는 "근거 불충분 — 약사/의사 확인 필요"라고 명시하세요.
4. 각 분석 항목에 근거 출처를 표기하세요: [Beers 2023], [STOPP/START v2], [FDA 라벨], [임상적 판단]
5. [임상적 판단]으로 표기한 항목은 반드시 "※ AI 참고의견이며 반드시 전문가 확인이 필요합니다"를 붙이세요.
6. 신뢰도를 각 항목에 표시하세요: 🟢높음(검증된 데이터 기반) / 🟡중간(일반적 약학 지식) / 🔴낮음(추가 확인 필요)

## 환자 정보
- 나이: ${patient.age}세 / 성별: ${patient.gender === "male" ? "남" : "여"}
- 증상: ${patient.symptoms}
- 기저질환: ${patient.conditions}

## 현재 처방 약물
${drugList}

${beersSection}
${stoppSection}
${startSection}
${fdaSection}

## 작성 요청 — 모든 내용을 한국어로

### [전문가용 리포트]
1. **약물 상호작용 분석** — FDA 라벨 데이터 기반으로만 분석. 데이터에 없으면 "FDA 라벨에서 확인된 상호작용 없음 — 추가 확인 권장"
2. **Beers Criteria 검토** — 위 [검증됨] 데이터 인용. 추가 의심 약물이 있으면 [임상적 판단] 표기
3. **STOPP/START Criteria 검토** — 위 [검증됨] 데이터 인용
4. **중복 처방 확인** — 동일 성분/계열 중복 여부
5. **용량 적절성** — 나이 고려, 불확실하면 "개별 환자 신기능 확인 필요" 명시
6. **종합 권고사항** — 구체적 처방 변경 제안

### [환자 상담용 리포트]
쉬운 한국어로:
1. 드시는 약 설명 (약 이름 + 왜 드시는지)
2. 주의사항
3. 이런 증상 나타나면 병원 방문
4. 생활 속 팁

⚠️ 환자 상담용 리포트 마지막에 반드시 추가:
"이 정보는 AI가 생성한 참고자료이며, 실제 복약지도는 담당 약사·의사와 상담하세요."

두 리포트를 "---SPLIT---"로 구분하세요.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content || "";
  const [professionalReport, patientReport] = text.split("---SPLIT---");

  return NextResponse.json({
    professionalReport: professionalReport?.trim() || text,
    patientReport: patientReport?.trim() || "",
    beers: beersResults,
    stopp: stoppResults,
    start: startResults,
    fdaSources: fdaData.length,
  });
}
