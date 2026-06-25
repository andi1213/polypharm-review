import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { image, mediaType } = await req.json();
  const dataUrl = `data:${mediaType};base64,${image}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          {
            type: "text",
            text: `이 이미지는 처방전, 약봉투, 또는 약 설명서입니다.
이미지에서 모든 약물 정보를 추출해주세요.

각 약물에 대해 다음 정보를 최대한 추출하세요:
- name: 약품명 (상품명)
- ingredient: 성분명 (알 수 있는 경우)
- dosage: 1회 투여 용량 (예: "500mg", "1정", "10mg/1정")
- frequency: 투여횟수 (예: "1일 3회", "1일 1회 아침 식후")
- duration: 투여기간 (예: "7일", "30일", "장기")

JSON 배열만 반환하세요. 다른 텍스트 없이 JSON만.
예시: [{"name":"타이레놀정500mg","ingredient":"아세트아미노펜","dosage":"1정","frequency":"1일 3회 식후","duration":"5일"}]`,
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content || "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const drugs = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

  return NextResponse.json({ drugs });
}
