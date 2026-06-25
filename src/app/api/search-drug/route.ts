import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.DRUG_API_KEY;
const BASE_URL = "https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "";
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!API_KEY) {
    return NextResponse.json({ results: [], error: "약학정보원 API 키가 설정되지 않았습니다." });
  }

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    type: "json",
    numOfRows: "10",
    itemName: query,
  });

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    const text = await res.text();
    const data = JSON.parse(text);
    const items = data?.body?.items || [];
    const results = items.map((item: any) => ({
      itemName: item.itemName || "",
      entpName: item.entpName || "",
      efcyQesitm: (item.efcyQesitm || "").replace(/<[^>]*>/g, ""),
      useMethodQesitm: (item.useMethodQesitm || "").replace(/<[^>]*>/g, ""),
      atpnWarnQesitm: (item.atpnWarnQesitm || "").replace(/<[^>]*>/g, ""),
      atpnQesitm: (item.atpnQesitm || "").replace(/<[^>]*>/g, ""),
      intrcQesitm: (item.intrcQesitm || "").replace(/<[^>]*>/g, ""),
      seQesitm: (item.seQesitm || "").replace(/<[^>]*>/g, ""),
      depositMethodQesitm: (item.depositMethodQesitm || "").replace(/<[^>]*>/g, ""),
      itemImage: item.itemImage || "",
    }));
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ results: [], error: "약학정보원 API 조회 실패: " + e.message });
  }
}
