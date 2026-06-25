import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkBeers, checkStoppStart } from "@/lib/beers-criteria";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { patient, drugs } = await req.json();

  const drugNames = drugs.map((d: any) => `${d.name} ${d.ingredient}`.trim());
  const beersResults = patient.age >= 65 ? checkBeers(drugNames) : [];
  const stoppStartResults = checkStoppStart(drugNames, patient.conditions || "");
  const stoppResults = stoppStartResults.filter((r) => r.action === "STOPP");
  const startResults = stoppStartResults.filter((r) => r.action === "START");

  const drugList = drugs
    .map((d: any, i: number) => `${i + 1}. ${d.name} (${d.ingredient}) - ${d.dosage}, ${d.frequency}, ${d.duration}`)
    .join("\n");

  const beersSection = beersResults.length > 0
    ? `\n## 시스템 자동 탐지: Beers Criteria 해당 약물\n${beersResults.map((b) => `- ${b.drugKo}(${b.drug}): ${b.reason} → ${b.recommendation} [심각도: ${b.severity}]`).join("\n")}`
    : "\n## Beers Criteria: 해당 약물 없음";

  const stoppSection = stoppResults.length > 0
    ? `\n## 시스템 자동 탐지: STOPP Criteria 해당\n${stoppResults.map((s) => `- [${s.id}] ${s.drugsKo.join(", ")}: ${s.reason}`).join("\n")}`
    : "";

  const startSection = startResults.length > 0
    ? `\n## 시스템 자동 탐지: START Criteria (추가 고려 약물)\n${startResults.map((s) => `- [${s.id}] ${s.drugsKo.join(", ")}: ${s.condition} → ${s.reason}`).join("\n")}`
    : "";

  const prompt = `당신은 노인약학 전문 임상약사입니다. 아래 정보를 바탕으로 다제약물 검토 리포트를 작성하세요.
모든 내용을 한국어로 작성하세요.

## 환자 정보
- 나이: ${patient.age}세 / 성별: ${patient.gender === "male" ? "남" : "여"}
- 증상: ${patient.symptoms}
- 기저질환: ${patient.conditions}

## 현재 처방 약물
${drugList}

${beersSection}
${stoppSection}
${startSection}

## 작성 요청

### [전문가용 리포트]
위 시스템 자동 탐지 결과를 포함하여 다음을 분석하세요:
1. **약물 상호작용 분석**: 잠재적 약물-약물 상호작용 (구체적 기전 포함)
2. **Beers Criteria 검토**: 위 탐지 결과 + 추가 검토
3. **STOPP/START Criteria 검토**: 위 탐지 결과 + 추가 분석
4. **중복 처방 확인**: 동일 계열/기전 중복 여부
5. **용량 적절성**: 나이·신기능 고려 용량 평가
6. **종합 권고사항**: 구체적인 처방 변경 제안 (대체약 포함)

### [환자 상담용 리포트]
쉬운 한국어로:
1. 드시는 약 간단 설명 (약 이름 + 왜 드시는지)
2. 주의사항 (음식, 시간, 피해야 할 것)
3. 이런 증상 나타나면 병원 방문 (부작용 관찰 포인트)
4. 생활 속 건강 팁

두 리포트를 "---SPLIT---"로 구분하세요.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
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
