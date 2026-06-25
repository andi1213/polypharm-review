import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name") || "";
  const apiKey = process.env.DRUG_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ results: [], message: "API 키 미설정" });
  }

  const url = `https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?serviceKey=${apiKey}&itemName=${encodeURIComponent(name)}&type=json&numOfRows=5`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.body?.items || [];
    return NextResponse.json({ results: items });
  } catch {
    return NextResponse.json({ results: [], message: "조회 실패" });
  }
}
