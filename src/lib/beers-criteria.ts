export interface BeersEntry {
  drug: string;
  drugKo: string;
  category: string;
  reason: string;
  recommendation: string;
  severity: "high" | "moderate" | "low";
}

export const BEERS_CRITERIA: BeersEntry[] = [
  // 항콜린성 약물
  { drug: "amitriptyline", drugKo: "아미트리프틸린", category: "삼환계 항우울제", reason: "강한 항콜린 작용, 진정, 기립성 저혈압 위험", recommendation: "SSRI 계열로 대체 권고", severity: "high" },
  { drug: "doxepin", drugKo: "독세핀", category: "삼환계 항우울제", reason: "강한 항콜린 작용, 진정 효과", recommendation: "6mg 이하 용량만 허용, 그 이상은 부적절", severity: "high" },
  { drug: "imipramine", drugKo: "이미프라민", category: "삼환계 항우울제", reason: "항콜린 작용, 기립성 저혈압", recommendation: "SSRI 또는 SNRI로 대체", severity: "high" },
  { drug: "chlorpheniramine", drugKo: "클로르페니라민", category: "1세대 항히스타민", reason: "강한 항콜린 작용, 인지기능 저하, 섬망 위험", recommendation: "2세대 항히스타민(세티리진, 로라타딘)으로 대체", severity: "high" },
  { drug: "diphenhydramine", drugKo: "디펜히드라민", category: "1세대 항히스타민", reason: "강한 항콜린 작용, 인지기능 저하, 낙상 위험", recommendation: "2세대 항히스타민으로 대체", severity: "high" },
  { drug: "hydroxyzine", drugKo: "히드록시진", category: "1세대 항히스타민", reason: "강한 항콜린 작용, 진정", recommendation: "2세대 항히스타민 또는 비약물 요법", severity: "high" },
  { drug: "dimenhydrinate", drugKo: "디멘히드리네이트", category: "1세대 항히스타민", reason: "항콜린 작용", recommendation: "단기 사용만 허용", severity: "moderate" },
  // 벤조디아제핀
  { drug: "diazepam", drugKo: "디아제팜", category: "장시간 작용 벤조디아제핀", reason: "과도한 진정, 낙상·골절 위험, 인지기능 저하", recommendation: "비벤조디아제핀 수면제 또는 비약물 요법", severity: "high" },
  { drug: "alprazolam", drugKo: "알프라졸람", category: "벤조디아제핀", reason: "낙상, 인지기능 저하, 섬망 위험", recommendation: "가능한 사용 회피, SSRI로 불안 치료", severity: "high" },
  { drug: "lorazepam", drugKo: "로라제팜", category: "벤조디아제핀", reason: "낙상, 인지기능 저하", recommendation: "최소 용량, 최단 기간 사용", severity: "high" },
  { drug: "clonazepam", drugKo: "클로나제팜", category: "벤조디아제핀", reason: "장기 사용 시 의존성, 낙상 위험", recommendation: "점진적 감량 고려", severity: "high" },
  { drug: "triazolam", drugKo: "트리아졸람", category: "벤조디아제핀", reason: "진정, 낙상 위험", recommendation: "비벤조디아제핀 수면제 고려", severity: "high" },
  // NSAIDs
  { drug: "indomethacin", drugKo: "인도메타신", category: "비스테로이드 소염제", reason: "위장관 출혈, 신기능 저하 위험이 다른 NSAID보다 높음", recommendation: "아세트아미노펜 또는 외용 NSAID로 대체", severity: "high" },
  { drug: "ketorolac", drugKo: "케토롤락", category: "비스테로이드 소염제", reason: "위장관 출혈, 신부전 위험", recommendation: "5일 이내 단기 사용만 허용", severity: "high" },
  { drug: "piroxicam", drugKo: "피록시캄", category: "비스테로이드 소염제", reason: "긴 반감기, 위장관 출혈 위험 높음", recommendation: "이부프로펜 등 단기작용 NSAID로 대체", severity: "moderate" },
  { drug: "meloxicam", drugKo: "멜록시캄", category: "비스테로이드 소염제", reason: "위장관 출혈, 신기능 저하", recommendation: "아세트아미노펜 우선 사용", severity: "moderate" },
  { drug: "naproxen", drugKo: "나프록센", category: "비스테로이드 소염제", reason: "위장관 출혈 위험 (장기 사용 시)", recommendation: "PPI 병용 또는 아세트아미노펜 대체", severity: "moderate" },
  // 항정신병약
  { drug: "haloperidol", drugKo: "할로페리돌", category: "항정신병약", reason: "추체외로 증상, 낙상, 인지기능 저하", recommendation: "치매 행동증상에 대한 일상적 사용 회피", severity: "high" },
  { drug: "risperidone", drugKo: "리스페리돈", category: "항정신병약", reason: "뇌졸중 위험 증가(치매 환자)", recommendation: "비약물 요법 우선, 최소 용량 단기간", severity: "moderate" },
  { drug: "quetiapine", drugKo: "쿠에티아핀", category: "항정신병약", reason: "과도한 진정, 대사 부작용", recommendation: "수면 목적 사용 회피", severity: "moderate" },
  { drug: "olanzapine", drugKo: "올란자핀", category: "항정신병약", reason: "강한 항콜린 작용, 대사증후군", recommendation: "다른 비정형 항정신병약 고려", severity: "moderate" },
  // 소화기
  { drug: "metoclopramide", drugKo: "메토클로프라미드", category: "위장관 운동촉진제", reason: "추체외로 증상(지연성 운동이상증)", recommendation: "12주 이상 사용 금지, 돔페리돈 고려", severity: "high" },
  // 근이완제
  { drug: "cyclobenzaprine", drugKo: "시클로벤자프린", category: "골격근 이완제", reason: "항콜린 작용, 진정, 낙상 위험", recommendation: "비약물 요법(물리치료) 우선", severity: "moderate" },
  { drug: "orphenadrine", drugKo: "오르페나드린", category: "골격근 이완제", reason: "강한 항콜린 작용", recommendation: "사용 회피", severity: "high" },
  // 혈당강하제
  { drug: "glibenclamide", drugKo: "글리벤클라미드", category: "설폰요소제", reason: "저혈당 위험 높음(장시간 작용)", recommendation: "글리클라지드 또는 글리메피리드로 대체", severity: "high" },
  { drug: "glyburide", drugKo: "글리부라이드", category: "설폰요소제", reason: "저혈당 위험 높음", recommendation: "다른 설폰요소제 또는 DPP-4 억제제", severity: "high" },
  { drug: "chlorpropamide", drugKo: "클로르프로파미드", category: "설폰요소제", reason: "지속적 저혈당, SIADH", recommendation: "사용 금지, 다른 혈당강하제로 대체", severity: "high" },
  // 항혈전제
  { drug: "ticlopidine", drugKo: "티클로피딘", category: "항혈소판제", reason: "혈액학적 부작용(호중구감소증, TTP)", recommendation: "클로피도그렐로 대체", severity: "high" },
  // 비뇨기
  { drug: "doxazosin", drugKo: "독사조신", category: "알파차단제", reason: "기립성 저혈압, 낙상 위험", recommendation: "탐스로신 등 선택적 알파차단제 고려", severity: "moderate" },
  // 기타
  { drug: "nitrofurantoin", drugKo: "니트로푸란토인", category: "항생제", reason: "신기능 저하 시 폐독성, 간독성", recommendation: "CrCl <30이면 사용 금지", severity: "moderate" },
  { drug: "mineral oil", drugKo: "미네랄 오일(유동파라핀)", category: "완하제", reason: "흡인 위험, 지용성 비타민 흡수 저하", recommendation: "삼투성 완하제(락툴로스)로 대체", severity: "moderate" },
];

export interface StoppEntry {
  id: string;
  section: string;
  drugs: string[];
  drugsKo: string[];
  condition: string;
  reason: string;
  action: "STOPP" | "START";
}

export const STOPP_START: StoppEntry[] = [
  // STOPP criteria
  { id: "A1", section: "심혈관계", drugs: ["digoxin"], drugsKo: ["디곡신"], condition: "심부전", reason: "125mcg/일 초과 시 독성 위험 증가 (노인 신기능 저하)", action: "STOPP" },
  { id: "A2", section: "심혈관계", drugs: ["verapamil", "diltiazem"], drugsKo: ["베라파밀", "딜티아젬"], condition: "심부전(NYHA III-IV)", reason: "음성 수축 작용으로 심부전 악화", action: "STOPP" },
  { id: "A3", section: "심혈관계", drugs: ["aspirin", "clopidogrel", "warfarin"], drugsKo: ["아스피린", "클로피도그렐", "와파린"], condition: "항응고제 + 항혈소판제 병용", reason: "출혈 위험 증가, PPI 병용 필요", action: "STOPP" },
  { id: "B1", section: "중추신경계", drugs: ["diazepam", "alprazolam", "lorazepam", "clonazepam"], drugsKo: ["디아제팜", "알프라졸람", "로라제팜", "클로나제팜"], condition: "30일 이상 사용", reason: "낙상 위험, 인지기능 저하, 의존성", action: "STOPP" },
  { id: "B2", section: "중추신경계", drugs: ["haloperidol", "risperidone", "olanzapine", "quetiapine"], drugsKo: ["할로페리돌", "리스페리돈", "올란자핀", "쿠에티아핀"], condition: "치매 환자 행동증상", reason: "뇌졸중 위험 증가, 사망률 증가", action: "STOPP" },
  { id: "C1", section: "위장관계", drugs: ["aspirin", "ibuprofen", "naproxen", "diclofenac"], drugsKo: ["아스피린", "이부프로펜", "나프록센", "디클로페낙"], condition: "PPI 없이 사용", reason: "위장관 출혈 위험", action: "STOPP" },
  { id: "D1", section: "근골격계", drugs: ["ibuprofen", "naproxen", "diclofenac", "meloxicam"], drugsKo: ["이부프로펜", "나프록센", "디클로페낙", "멜록시캄"], condition: "고혈압 또는 심부전 환자", reason: "혈압 상승, 체액 저류", action: "STOPP" },
  { id: "D2", section: "근골격계", drugs: ["corticosteroid"], drugsKo: ["코르티코스테로이드"], condition: "3개월 이상 장기 사용", reason: "골다공증, 부신 억제", action: "STOPP" },
  { id: "E1", section: "비뇨기계", drugs: ["oxybutynin", "tolterodine"], drugsKo: ["옥시부티닌", "톨테로딘"], condition: "인지기능 저하 환자", reason: "항콜린 작용으로 인지기능 추가 저하", action: "STOPP" },
  // START criteria
  { id: "S1", section: "심혈관계", drugs: ["statin"], drugsKo: ["스타틴"], condition: "관상동맥질환, 뇌혈관질환 병력", reason: "심혈관 이차 예방에 필수", action: "START" },
  { id: "S2", section: "심혈관계", drugs: ["ace_inhibitor", "arb"], drugsKo: ["ACE억제제", "ARB"], condition: "심부전 또는 심근경색 후", reason: "사망률 감소 근거 확립", action: "START" },
  { id: "S3", section: "근골격계", drugs: ["vitamin_d", "calcium"], drugsKo: ["비타민D", "칼슘"], condition: "골다공증 또는 코르티코스테로이드 장기 사용", reason: "골절 예방", action: "START" },
  { id: "S4", section: "내분비계", drugs: ["metformin"], drugsKo: ["메트포르민"], condition: "제2형 당뇨병 (금기 없는 경우)", reason: "1차 치료제, 심혈관 보호 효과", action: "START" },
  { id: "S5", section: "호흡기계", drugs: ["inhaled_corticosteroid"], drugsKo: ["흡입 코르티코스테로이드"], condition: "중등도-중증 천식 또는 COPD", reason: "급성 악화 예방", action: "START" },
  { id: "S6", section: "예방", drugs: ["pneumococcal_vaccine", "influenza_vaccine"], drugsKo: ["폐렴구균백신", "인플루엔자백신"], condition: "65세 이상", reason: "감염 예방, 사망률 감소", action: "START" },
];

export function checkBeers(drugNames: string[]): BeersEntry[] {
  const normalized = drugNames.map((d) => d.toLowerCase());
  return BEERS_CRITERIA.filter((entry) =>
    normalized.some((d) => d.includes(entry.drug) || d.includes(entry.drugKo))
  );
}

export function checkStoppStart(drugNames: string[], conditions: string): StoppEntry[] {
  const normalized = drugNames.map((d) => d.toLowerCase());
  const condNorm = conditions.toLowerCase();
  return STOPP_START.filter((entry) => {
    const drugMatch = entry.drugs.some((d) => normalized.some((n) => n.includes(d))) ||
      entry.drugsKo.some((d) => normalized.some((n) => n.includes(d)));
    return drugMatch;
  });
}
