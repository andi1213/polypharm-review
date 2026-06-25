import { NextRequest, NextResponse } from "next/server";
import { checkBeers, checkStoppStart } from "@/lib/beers-criteria";

export async function POST(req: NextRequest) {
  const { drugs, age, conditions } = await req.json();

  const drugNames = drugs.map((d: any) => `${d.name} ${d.ingredient}`.trim());

  const beersResults = age >= 65 ? checkBeers(drugNames) : [];
  const stoppStartResults = checkStoppStart(drugNames, conditions || "");

  const stoppResults = stoppStartResults.filter((r) => r.action === "STOPP");
  const startResults = stoppStartResults.filter((r) => r.action === "START");

  const duplicateGroups: Record<string, string[]> = {};
  drugs.forEach((d: any) => {
    const ingredient = (d.ingredient || "").toLowerCase().trim();
    if (ingredient) {
      if (!duplicateGroups[ingredient]) duplicateGroups[ingredient] = [];
      duplicateGroups[ingredient].push(d.name);
    }
  });
  const duplicates = Object.entries(duplicateGroups)
    .filter(([, names]) => names.length > 1)
    .map(([ingredient, names]) => ({ ingredient, drugs: names }));

  return NextResponse.json({
    beers: beersResults,
    stopp: stoppResults,
    start: startResults,
    duplicates,
  });
}
