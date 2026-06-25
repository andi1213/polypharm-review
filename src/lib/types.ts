export interface PatientInfo {
  name: string;
  age: number;
  gender: "male" | "female";
  symptoms: string;
  conditions: string;
}

export interface Drug {
  id: string;
  name: string;
  ingredient: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface ReviewResult {
  id: string;
  date: string;
  patient: PatientInfo;
  drugs: Drug[];
  professionalReport: string;
  patientReport: string;
}
