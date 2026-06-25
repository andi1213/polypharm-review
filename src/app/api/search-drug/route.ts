import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchOpenFDA(query: string) {
  const encodedQuery = encodeURIComponent(query);
  const urls = [
    `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodedQuery}"+openfda.generic_name:"${encodedQuery}"&limit=5`,
    `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodedQuery}"&limit=5`,
    `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodedQuery}"&limit=5`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.results?.length > 0) return data.results;
    } catch {}
  }
  return [];
}

async function translateToKorean(items: any[]): Promise<any[]> {
  if (items.length === 0) return [];

  const summary = items.map((item: any) => ({
    brandName: item.openfda?.brand_name?.[0] || "",
    genericName: item.openfda?.generic_name?.[0] || "",
    manufacturer: item.openfda?.manufacturer_name?.[0] || "",
    purpose: item.purpose?.[0]?.slice(0, 100) || item.indications_and_usage?.[0]?.slice(0, 100) || "",
    dosage: item.dosage_and_administration?.[0]?.slice(0, 150) || "",
    warnings: item.warnings?.[0]?.slice(0, 100) || "",
  }));

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `다음 약물 정보를 한국어로 번역해주세요. JSON 배열만 반환하세요.
각 항목: {"brandName":"상품명","genericName":"성분명(한글)","manufacturer":"제조사","purpose":"효능효과","dosage":"용법용량","warnings":"주의사항"}

${JSON.stringify(summary)}`,
        },
      ],
    });
    const text = response.choices[0]?.message?.content || "";
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : summary;
  } catch {
    return summary;
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "";
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const fdaResults = await searchOpenFDA(query);
  const translated = await translateToKorean(fdaResults);

  return NextResponse.json({ results: translated });
}
