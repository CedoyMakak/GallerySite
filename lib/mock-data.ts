import { Painting } from "@/types/painting";

export const initialPaintings: Painting[] = [
  {
    id: "whisper-sunset",
    title: "Whisper of Sunset",
    description: "Warm evening palette with soft horizon transitions.",
    price: 45000,
    dimensions: "50 x 70 cm",
    technique: "Oil on Canvas",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1200",
    sold: false
  },
  {
    id: "mountain-storm",
    title: "Mountain Storm",
    description: "Dramatic alpine movement and layered atmosphere.",
    price: 32000,
    dimensions: "60 x 80 cm",
    technique: "Acrylic on Canvas",
    imageUrl:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1200",
    sold: false
  },
  {
    id: "abstraction-4",
    title: "Abstraction No.4",
    description: "Geometric rhythm with textured mixed-media accents.",
    price: 18500,
    dimensions: "40 x 40 cm",
    technique: "Mixed Media",
    imageUrl:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=1200",
    sold: false
  }
];
