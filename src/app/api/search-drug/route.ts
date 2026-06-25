import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.DRUG_API_KEY;
const BASE_URL = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "";
  const searchBy = req.nextUrl.searchParams.get("searchBy") || "name";

  if (!API_KEY) {
    return NextResponse.json({ results: [], message: "약학정보원 API 키 미설정" });
  }

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    type: "json",
    numOfRows: "10",
  });

  if (searchBy === "ingredient") {
    params.set("itemName", "");
    params.set("efcyQesitm", query);
  } else {
    params.set("itemName", query);
  }

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    const data = await res.json();
    const items = data?.body?.items || [];
    const results = items.map((item: any) => ({
      itemName: item.itemName || "",
      entpName: item.entpName || "",
      efcyQesitm: item.efcyQesitm || "",
      useMethodQesitm: item.useMethodQesitm || "",
      atpnQesitm: item.atpnQesitm || "",
      itemImage: item.itemImage || "",
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], message: "조회 실패" });
  }
}
