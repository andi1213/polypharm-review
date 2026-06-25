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
            text: `이 처방전 이미지에서 약물 정보를 추출해주세요.
JSON 배열로 반환해주세요. 각 항목: {"name": "약품명", "ingredient": "성분명(알면)", "dosage": "용량", "frequency": "투여횟수", "duration": "투여기간"}
JSON만 반환하세요.`,
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
