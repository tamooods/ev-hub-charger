import type { BrandInfo } from "@/lib/types";

const BRANDS: BrandInfo[] = [
  {
    id: "ptt",
    label: "PTT",
    keywords: ["PTT"],
    app: "PTT EV Station",
    color: "#0ea5e9",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/PTT_Public_Company_logo.svg",
  },
  {
    id: "igreen",
    label: "iGreen+",
    keywords: ["IGREEN"],
    app: "iGreen+",
    color: "#16a34a",
    logoUrl: null,
  },
  {
    id: "spark",
    label: "SPARK EV",
    keywords: ["SPARK"],
    app: "SPARK EV",
    color: "#f97316",
    logoUrl: null,
  },
  {
    id: "onecharge",
    label: "OneCharge",
    keywords: ["ONECHARGE"],
    app: "OneCharge",
    color: "#8b5cf6",
    logoUrl: null,
  },
  {
    id: "elexa",
    label: "Elexa",
    keywords: ["ELEXA"],
    app: "Elexa",
    color: "#ec4899",
    logoUrl: null,
  },
  {
    id: "pea-volta",
    label: "PEA Volta",
    keywords: ["PEA VOLTA", "PEA"],
    app: "PEA Volta",
    color: "#eab308",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/Logo_of_the_Provincial_Electricity_Authority_of_Thailand.svg",
  },
  {
    id: "evolt",
    label: "Evolt",
    keywords: ["EVOLT"],
    app: "Evolt",
    color: "#6366f1",
    logoUrl: null,
  },
  {
    id: "nexmoev",
    label: "NEXMOEV",
    keywords: ["NEXMOEV"],
    app: "NEXMOEV",
    color: "#06b6d4",
    logoUrl: null,
  },
  {
    id: "tpi",
    label: "TPI",
    keywords: ["TPI"],
    app: null,
    color: "#dc2626",
    logoUrl: null,
  },
  {
    id: "ev-one",
    label: "EV One",
    keywords: ["EV ONE"],
    app: null,
    color: "#22c55e",
    logoUrl: null,
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
    logoUrl: null,
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
