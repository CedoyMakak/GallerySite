export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  authorName: string;
  text: string;
  rating: number | null;
  status: ReviewStatus;
  createdAt: string;
};

export type ReviewRow = {
  id: string;
  author_name: string;
  text: string;
  rating: number | null;
  status: ReviewStatus;
  created_at: string;
};

export function reviewFromRow(row: ReviewRow): Review {
  return {
    id: row.id,
    authorName: row.author_name,
    text: row.text,
    rating: row.rating,
    status: row.status,
    createdAt: row.created_at,
  };
}
