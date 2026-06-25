import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { patient, drugs } = await req.json();

  const drugList = drugs
    .map((d: any, i: number) => `${i + 1}. ${d.name} (${d.ingredient}) - ${d.dosage}, ${d.frequency}, ${d.duration}`)
    .join("\n");

  const prompt = `당신은 노인약학 전문 임상약사입니다. 다음 환자의 다제약물 처방을 검토해주세요.

## 환자 정보
- 나이: ${patient.age}세 / 성별: ${patient.gender === "male" ? "남" : "여"}
- 증상: ${patient.symptoms}
- 기저질환: ${patient.conditions}

## 현재 처방 약물
${drugList}

## 검토 요청사항
다음 두 가지 버전으로 작성해주세요:

### [전문가용 리포트]
1. **약물 상호작용 분석**: 잠재적 약물-약물 상호작용
2. **Beers Criteria 검토**: 65세 이상인 경우 부적절 약물 여부
3. **STOPP/START Criteria 검토**: 중단 고려 약물 및 추가 고려 약물
4. **중복 처방 확인**: 동일 계열 중복 여부
5. **용량 적절성**: 나이/신기능 고려 용량 평가
6. **종합 권고사항**: 처방 변경 제안

### [환자 상담용 리포트]
환자가 이해하기 쉬운 언어로:
1. 현재 드시는 약 간단 설명
2. 주의사항 (음식, 시간 등)
3. 부작용 관찰 포인트
4. 생활 속 팁

두 리포트를 "---SPLIT---"로 구분해주세요.`;

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
  });
}
