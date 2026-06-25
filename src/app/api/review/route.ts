import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkBeers, checkStoppStart } from "@/lib/beers-criteria";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { patient, drugs, fdaSummaries } = await req.json();

  const allNames = drugs.map((d: any) => `${d.name} ${d.ingredient}`.trim());
  const beersResults = patient.age >= 65 ? checkBeers(allNames) : [];
  const stoppStartResults = checkStoppStart(allNames, patient.conditions || "");
  const stoppResults = stoppStartResults.filter((r) => r.action === "STOPP");
  const startResults = stoppStartResults.filter((r) => r.action === "START");

  const drugList = drugs
    .map((d: any, i: number) => `${i + 1}. ${d.name} (${d.ingredient}) - ${d.dosage}, ${d.frequency}, ${d.duration}`)
    .join("\n");

  const beersSection = beersResults.length > 0
    ? `\n## [검증됨] Beers Criteria 해당 약물 (AGS 2023)\n${beersResults.map((b) => `- ${b.drugKo}(${b.drug}): ${b.reason} → ${b.recommendation} [심각도: ${b.severity}]`).join("\n")}`
    : "\n## [검증됨] Beers Criteria: 해당 약물 없음";

  const stoppSection = stoppResults.length > 0
    ? `\n## [검증됨] STOPP Criteria 해당\n${stoppResults.map((s) => `- [${s.id}] ${s.drugsKo.join(", ")}: ${s.reason}`).join("\n")}`
    : "";

  const startSection = startResults.length > 0
    ? `\n## [검증됨] START Criteria 추가 고려 약물\n${startResults.map((s) => `- [${s.id}] ${s.drugsKo.join(", ")}: ${s.condition} → ${s.reason}`).join("\n")}`
    : "";

  const fdaSection = (fdaSummaries || []).length > 0
    ? `\n## [검증됨] FDA 약물 라벨 정보\n${fdaSummaries.map((f: any) => {
        if (!f?.fda) return `### ${f.ingredient}: FDA 데이터 없음`;
        return `### ${f.ingredient} (${f.englishName})
- 상호작용: ${f.fda.drugInteractions || "정보 없음"}
- 경고: ${f.fda.warnings || "정보 없음"}
- 금기: ${f.fda.contraindications || "정보 없음"}
- 이상반응: ${f.fda.adverseReactions || "정보 없음"}`;
      }).join("\n\n")}`
    : "";

  const prompt = `당신은 노인약학 전문 임상약사입니다.

## 중요 규칙
1. 아래 [검증됨] 데이터만을 근거로 분석하세요.
2. 제공된 데이터에 없는 상호작용이나 부작용을 지어내지 마세요.
3. 확실하지 않으면 "근거 불충분 — 약사/의사 확인 필요"로 명시하세요.
4. 각 항목에 출처 표기: [Beers 2023], [STOPP/START v2], [FDA 라벨], [임상적 판단]
5. [임상적 판단] 항목에는 "※ AI 참고의견이며 전문가 확인 필요" 표기
6. 신뢰도 표시: 🟢높음(검증 데이터) / 🟡중간(일반 약학 지식) / 🔴낮음(추가 확인)

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

## 작성 (모두 한국어)

### [전문가용 리포트]
1. **약물 상호작용 분석** — FDA 라벨 데이터 기반. 데이터 없으면 "FDA 라벨 미확인 — 추가 확인 권장"
2. **Beers Criteria 검토** — [검증됨] 데이터 인용
3. **STOPP/START Criteria 검토** — [검증됨] 데이터 인용
4. **중복 처방 확인** — 동일 성분/계열 중복
5. **용량 적절성** — 불확실하면 "개별 환자 신기능 확인 필요"
6. **종합 권고사항** — 구체적 변경 제안

### [환자 상담용 리포트]
쉬운 한국어로:
1. 드시는 약 설명
2. 주의사항
3. 이런 증상 나타나면 병원 방문
4. 생활 속 팁

마지막에: "이 정보는 AI가 생성한 참고자료이며, 실제 복약지도는 담당 약사·의사와 상담하세요."

두 리포트를 "---SPLIT---"로 구분.`;

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
  });
}
