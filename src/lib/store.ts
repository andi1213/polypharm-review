import { ReviewResult } from "./types";

const STORAGE_KEY = "polypharm-reviews";

export function saveReview(review: ReviewResult) {
  if (typeof window === "undefined") return;
  const existing = getReviews();
  existing.unshift(review);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getReviews(): ReviewResult[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function deleteReview(id: string) {
  if (typeof window === "undefined") return;
  const existing = getReviews().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}
