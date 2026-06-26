import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const API_KEY = process.env.DRUG_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_KEY });

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]*>/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

// 1차: 약학정보원 e약은요 (일반의약품 위주)
async function searchEyakunyo(query: string) {
  if (!API_KEY) return [];
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    type: "json",
    numOfRows: "10",
    itemName: query,
  });
  try {
    const res = await fetch(
      `https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?${params.toString()}`
    );
    const data = await res.json();
    return (data?.body?.items || []).map((item: any) => ({
      itemName: item.itemName || "",
      entpName: item.entpName || "",
      etcOtcCode: "",
      efcyQesitm: stripHtml(item.efcyQesitm),
      useMethodQesitm: stripHtml(item.useMethodQesitm),
      atpnQesitm: stripHtml(item.atpnQesitm),
      intrcQesitm: stripHtml(item.intrcQesitm),
      seQesitm: stripHtml(item.seQesitm),
      itemImage: item.itemImage || "",
      source: "약학정보원(e약은요)",
    }));
  } catch {
    return [];
  }
}

// 2차: 의약품안전나라 nedrug (전문의약품 포함)
async function searchNedrug(query: string) {
  try {
    const searchRes = await fetch(
      `https://nedrug.mfds.go.kr/searchDrug?searchYn=true&itemName=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await searchRes.text();
    const seqMatches = html.match(/itemSeq=(\d+)/g);
    if (!seqMatches) return [];

    const uniqueSeqs = [...new Set(seqMatches.map((m: string) => m.replace("itemSeq=", "")))].slice(0, 5);

    const details = await Promise.all(
      uniqueSeqs.map(async (seq: string) => {
        try {
          const res = await fetch(
            `https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=${seq}&openDataInfoOpenData=Y`,
            { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } }
          );
          const data = await res.json();
          const item = data.item;
          if (!item) return null;
          return {
            itemName: item.itemName || "",
            entpName: item.entpName || "",
            etcOtcCode: item.etcOtcCode || "",
            efcyQesitm: stripHtml(item.eeDocData),
            useMethodQesitm: stripHtml(item.udDocData),
            atpnQesitm: stripHtml(item.nbDocData),
            intrcQesitm: "",
            seQesitm: "",
            itemImage: "",
            source: "의약품안전나라(nedrug)",
          };
        } catch {
          return null;
        }
      })
    );
    return details.filter(Boolean);
  } catch {
    return [];
  }
}

// 3차: GPT 폴백
async function gptDrugLookup(query: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `한국에서 사용되는 약물 "${query}"에 대한 정보를 JSON 배열로 알려주세요.
정확히 아는 정보만 적고, 모르면 빈 문자열로.

[{"itemName":"제품명","entpName":"제조사","etcOtcCode":"전문/일반","efcyQesitm":"효능효과","useMethodQesitm":"용법용량","atpnQesitm":"주의사항","intrcQesitm":"상호작용","seQesitm":"부작용","itemImage":"","source":"AI조회(확인필요)"}]

JSON 배열만 반환.`,
        },
      ],
    });
    const text = response.choices[0]?.message?.content || "";
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "";
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // 1차: e약은요
  let results = await searchEyakunyo(query);

  // 2차: 결과 없으면 nedrug (전문의약품 포함)
  if (results.length === 0) {
    results = await searchNedrug(query);
  }

  // 3차: 둘 다 없으면 GPT 폴백
  if (results.length === 0) {
    results = await gptDrugLookup(query);
  }

  return NextResponse.json({ results });
}
