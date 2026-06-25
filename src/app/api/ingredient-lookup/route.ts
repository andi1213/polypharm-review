import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function isKorean(text: string) {
  return /[가-힣]/.test(text);
}

async function translateToEnglish(ingredient: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 50,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `한국어 약물 성분명을 영문 generic name으로 변환하세요. 영문 이름만 반환하세요.\n입력: ${ingredient}`,
      },
    ],
  });
  return (response.choices[0]?.message?.content || ingredient).trim().replace(/['"]/g, "").toLowerCase();
}

async function searchOpenFDA(ingredient: string) {
  const encoded = encodeURIComponent(ingredient);
  const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encoded}"&limit=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const label = data.results?.[0];
    if (!label) return null;
    return {
      genericName: label.openfda?.generic_name?.[0] || ingredient,
      brandNames: label.openfda?.brand_name || [],
      drugInteractions: (label.drug_interactions?.[0] || "").slice(0, 1000),
      warnings: (label.warnings?.[0] || "").slice(0, 1000),
      contraindications: (label.contraindications?.[0] || "").slice(0, 500),
      adverseReactions: (label.adverse_reactions?.[0] || "").slice(0, 500),
      pharmacoClass: label.openfda?.pharm_class_epc || [],
    };
  } catch {
    return null;
  }
}

async function translateFDAData(fdaData: any): Promise<any> {
  if (!fdaData) return null;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `다음 FDA 약물 데이터를 한국어로 번역하세요. JSON으로 반환. 키 이름은 유지.
핵심 내용만 간결하게 번역하세요.

${JSON.stringify(fdaData)}`,
        },
      ],
    });
    const text = response.choices[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : fdaData;
  } catch {
    return fdaData;
  }
}

export async function POST(req: NextRequest) {
  const { ingredient } = await req.json();
  if (!ingredient) {
    return NextResponse.json({ error: "성분명이 필요합니다." });
  }

  let englishName = ingredient;
  if (isKorean(ingredient)) {
    englishName = await translateToEnglish(ingredient);
  }

  const fdaData = await searchOpenFDA(englishName);
  const translated = fdaData ? await translateFDAData(fdaData) : null;

  return NextResponse.json({
    ingredient,
    englishName,
    fda: translated,
    fdaRaw: fdaData,
  });
}
