import type { BrandInfo } from "@/lib/types";

const BRANDS: BrandInfo[] = [
  {
    id: "ptt",
    label: "PTT",
    keywords: ["PTT"],
    app: "PTT EV Station",
    color: "#0ea5e9",
    logoUrl: "/brands/ptt.png",
  },
  {
    id: "igreen",
    label: "iGreen+",
    keywords: ["IGREEN"],
    app: "iGreen+",
    color: "#16a34a",
    logoUrl: "/brands/igreen.jpg",
  },
  {
    id: "spark",
    label: "SPARK EV",
    keywords: ["SPARK"],
    app: "SPARK EV",
    color: "#f97316",
    logoUrl: "/brands/sparkev.png",
  },
  {
    id: "onecharge",
    label: "OneCharge",
    keywords: ["ONECHARGE"],
    app: "OneCharge",
    color: "#8b5cf6",
    logoUrl: "/brands/onecharge.jpeg",
  },
  {
    id: "elexa",
    label: "Elexa",
    keywords: ["ELEXA"],
    app: "Elexa",
    color: "#ec4899",
    logoUrl: "/brands/elexa.png",
  },
  {
    id: "pea-volta",
    label: "PEA Volta",
    keywords: ["PEA VOLTA", "PEA"],
    app: "PEA Volta",
    color: "#eab308",
    logoUrl: "/brands/peavolta.png",
  },
  {
    id: "evolt",
    label: "Evolt",
    keywords: ["EVOLT"],
    app: "Evolt",
    color: "#6366f1",
    logoUrl: "/brands/evolt.png",
  },
  {
    id: "nexmoev",
    label: "NEXMOEV",
    keywords: ["NEXMOEV"],
    app: "NEXMOEV",
    color: "#06b6d4",
    logoUrl: "/brands/nexmoev.png",
  },
  {
    id: "tpi",
    label: "TPI",
    keywords: ["TPI"],
    app: null,
    color: "#dc2626",
    logoUrl: "/brands/tpi.svg",
  },
  {
    id: "ev-one",
    label: "EV One",
    keywords: ["EV ONE"],
    app: null,
    color: "#22c55e",
    logoUrl: "/brands/evone.png",
  },
  {
    id: "acharge",
    label: "Acharge",
    keywords: ["ACHARGE"],
    app: "Acharge",
    color: "#a855f7",
    logoUrl: null,
  },
  {
    id: "kq",
    label: "KQ Charge",
    keywords: ["KQ CHARGE", "KQ"],
    app: "KQ Charge",
    color: "#14b8a6",
    logoUrl: "/brands/kqcharge.png",
  },
];

export function detectBrand(name: string): BrandInfo | null {
  const upper = name.toUpperCase();
  for (const brand of BRANDS) {
    for (const keyword of brand.keywords) {
      if (upper.includes(keyword)) {
        return brand;
      }
    }
  }
  return null;
}

export function getBrand(id: string): BrandInfo | null {
  return BRANDS.find((brand) => brand.id === id) ?? null;
}

export function getBrands(): BrandInfo[] {
  return BRANDS;
}
