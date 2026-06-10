export type Painting = {
  id: string;
  title: string;
  description: string;
  price: number;
  dimensions: string;
  technique: string;
  imageUrl: string;
  sold: boolean;
};

/** Row shape returned by Supabase `paintings` table */
export type PaintingRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  dimensions: string;
  technique: string;
  image_url: string;
  sold: boolean;
  created_at?: string;
};

export function paintingFromRow(row: PaintingRow): Painting {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    price: row.price,
    dimensions: row.dimensions,
    technique: row.technique,
    imageUrl: row.image_url,
    sold: row.sold,
  };
}
