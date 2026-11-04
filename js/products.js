/**
 * Product Catalogue
 * Categorized into:
 * - "3d-printed": Additive engineering prototypes and low-volume composite parts
 * - "injection-molded": High-tonnage precision injection molded products & logistics components
 */

const PRODUCT_CATALOGUE = [
  // 3D Printed
  {
    id: "pa-cf-drone-arm",
    title: "Carbon Fiber (PA-CF) Drone Arm",
    desc: "High-rigidity lightweight structural drone arm printed on our Bambu Lab H2S Combo with carbon fiber nylon composite (PA-CF).",
    category: "3d-printed",
    images: [
      "assets/images/aerospace-component.png",
      "assets/images/bambu-lab.jpg"
    ]
  },
  {
    id: "medical-device-casing",
    title: "Medical Device Prototype Casing",
    desc: "Biocompatible engineering prototype enclosure printed in ABS with functional snap-fit joints and 10W laser-engraved serial ID.",
    category: "3d-printed",
    images: [
      "assets/images/medical-device.png",
      "assets/images/bambu-lab.jpg"
    ]
  },
  {
    id: "high-temp-bracket",
    title: "Polycarbonate Structural Bracket",
    desc: "Functional mechanical test bracket printed in pure Polycarbonate (PC) using an actively heated 65°C chamber for high-load durability.",
    category: "3d-printed",
    images: [
      "assets/images/slide-polycarbonate.png",
      "assets/images/bambu-lab.jpg"
    ]
  },

  // Injection Molded
  {
    id: "foldable-crate",
    title: "Foldable Industrial Crate",
    desc: "High-impact, space-saving plastic folding crates precision molded for warehousing, logistics, and bulk distribution.",
    category: "injection-molded",
    images: [
      "assets/images/products/foldable-crate/1.png",
      "assets/images/products/foldable-crate/2.png",
      "assets/images/products/foldable-crate/3.png",
      "assets/images/products/foldable-crate/4.png",
      "assets/images/products/foldable-crate/5.png"
    ]
  },
  {
    id: "fishing-bucket",
    title: "Precision Molded Multi-Utility Bucket",
    desc: "High-density polyethylene molded bucket featuring ergonomic reinforced handle and high-impact drop resistance.",
    category: "injection-molded",
    images: [
      "assets/images/products/fishing-bucket/1.png",
      "assets/images/products/fishing-bucket/2.png",
      "assets/images/products/fishing-bucket/3.png",
      "assets/images/products/fishing-bucket/4.png",
      "assets/images/products/fishing-bucket/5.png"
    ]
  },
  {
    id: "warehouse-separator",
    title: "Warehouse Modular Bin Separator",
    desc: "Durable injection molded polypropylene dividers engineered to optimize and organize industrial storage racking.",
    category: "injection-molded",
    images: [
      "assets/images/products/warehouse-seperator/1.png",
      "assets/images/products/warehouse-seperator/2.png",
      "assets/images/products/warehouse-seperator/3.png"
    ]
  },
  {
    id: "drain-basket",
    title: "Dual-Polymer Strainer & Basin",
    desc: "Precision two-component molded food-grade PP colander with transparent PET basin and ergonomic rim handles.",
    category: "injection-molded",
    images: [
      "assets/images/products/drain-basket/1.png",
      "assets/images/products/drain-basket/2.png",
      "assets/images/products/drain-basket/3.png"
    ]
  },
  {
    id: "brush-set",
    title: "Engineered Sanitary Brush System",
    desc: "Custom molded dual-density bristled cleaning tool with anti-drip ventilated holder and molded snap lid.",
    category: "injection-molded",
    images: [
      "assets/images/products/brush-set/1.png",
      "assets/images/products/brush-set/2.png"
    ]
  }
];
