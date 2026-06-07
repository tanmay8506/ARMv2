export interface PortfolioLookbook {
  id: string;
  lookNumber: string;
  title: string;
  description: string;
  coverPath: string;
  videoPath?: string;
  images: string[];
  category: string;
  aspectRatio: string; // "3/4" or "4/5" or "1/1"
  width: number;
  height: number;
}

export interface HairAsset {
  id: string;
  title: string;
  description: string;
  imagePath: string;
}

export interface StandaloneReel {
  id: string;
  videoPath: string;
  title: string;
  category: string;
}

export const lookbooks: PortfolioLookbook[] = [
  {
    id: "look-01",
    lookNumber: "Look 01",
    title: "Royal Rajgharana Bridal",
    description: "dense traditional Rajasthani bridal cuffs featuring intricate floral mandalas, peacock motifs, and heavy finger details. A timeless, majestic presentation.",
    coverPath: "/portfolio/model1_1.jpeg",
    videoPath: "/portfolio/model1.mp4",
    images: [
      "/portfolio/model1_1.jpeg",
      "/portfolio/model1_3.jpeg",
      "/portfolio/model1_4.jpeg"
    ],
    category: "Bridal",
    aspectRatio: "3/4",
    width: 3,
    height: 4
  },
  {
    id: "look-02",
    lookNumber: "Look 02",
    title: "Contemporary Indo-Arabic",
    description: "Modern fusion pattern featuring elegant negative space geometric bands, delicate floral vines, and minimalist fingertips. Calibrated for modern brides.",
    coverPath: "/portfolio/model2_1.jpeg",
    videoPath: "/portfolio/model2.mp4",
    images: [
      "/portfolio/model2_1.jpeg",
      "/portfolio/model2_2.jpeg"
    ],
    category: "Arabic",
    aspectRatio: "3/4",
    width: 3,
    height: 4
  },
  {
    id: "look-03",
    lookNumber: "Look 03",
    title: "Bold Modern Arabic",
    description: "Flowing bold Arabic contours with shaded borders and thick foliage outlines, contrasted against fine net filler grid detailing.",
    coverPath: "/portfolio/model3_1.jpeg",
    videoPath: "/portfolio/model3.mp4",
    images: [
      "/portfolio/model3_1.jpeg",
      "/portfolio/model3_2.jpeg",
      "/portfolio/model3_3.jpeg"
    ],
    category: "Arabic",
    aspectRatio: "3/4",
    width: 3,
    height: 4
  },
  {
    id: "look-04",
    lookNumber: "Look 04",
    title: "Traditional Bharat Heritage",
    description: "Classic back-hand mandala motifs paired with symmetrical wrist line chains. A gorgeous layout celebrating centuries-old temple design styles.",
    coverPath: "/portfolio/model4_1.jpeg",
    videoPath: "/portfolio/model4.mov",
    images: [
      "/portfolio/model4_1.jpeg",
      "/portfolio/model4_2.jpeg",
      "/portfolio/model4_3.jpeg"
    ],
    category: "Traditional",
    aspectRatio: "3/4",
    width: 3,
    height: 4
  },
  {
    id: "look-05",
    lookNumber: "Look 05",
    title: "Lotus & Rose Bud Luxury",
    description: "Exquisite lotus motifs and negative-space rose blooms, flowing up the arm in a dense but clean layout. The ultimate signature look book for premium brides.",
    coverPath: "/portfolio/model5_2.png",
    videoPath: "/portfolio/model5.mp4",
    images: [
      "/portfolio/model5_2.png",
      "/portfolio/model5_1.jpeg",
      "/portfolio/model5_3.jpeg",
      "/portfolio/model5_4.jpeg"
    ],
    category: "Bridal",
    aspectRatio: "3/4",
    width: 3,
    height: 4
  },
  {
    id: "look-06",
    lookNumber: "Look 06",
    title: "Glove Mesh Minimalist",
    description: "Delicate mesh pattern extending to the fingers like a lace glove, adorned with a focal mandala and heavily tipped fingers.",
    coverPath: "/portfolio/model6_1.png",
    videoPath: "/portfolio/model6.mp4",
    images: [
      "/portfolio/model6_1.png",
      "/portfolio/model6_2.png"
    ],
    category: "Indo-Arabic",
    aspectRatio: "3/4",
    width: 3,
    height: 4
  },
  {
    id: "look-07",
    lookNumber: "Look 07",
    title: "Royal Portrait Henna",
    description: "Miniature bride-and-groom portrait cuffs woven seamlessly into traditional filler networks, perfect for personalized custom storytelling.",
    coverPath: "/portfolio/model7_1.png",
    images: [
      "/portfolio/model7_1.png",
      "/portfolio/model7_2.png"
    ],
    category: "Traditional",
    aspectRatio: "3/4",
    width: 3,
    height: 4
  }
];

export const hairStyles: HairAsset[] = [
  {
    id: "hair-01",
    title: "Textured Low Bun",
    description: "Soft textured waves gathered in a low classic bridal bun, accented with baby's breath and fresh roses.",
    imagePath: "/portfolio/hair/hair1.jpeg"
  },
  {
    id: "hair-02",
    title: "Editorial Floral Braid",
    description: "A loose, voluminous textured braid trailing down, interwoven with custom floral pearls and jasmine garlands.",
    imagePath: "/portfolio/hair/hair2.jpeg"
  },
  {
    id: "hair-03",
    title: "Hollywood Waves",
    description: "Glamorous, high-shine waves structured to frame the face beautifully for reception lookbook styles.",
    imagePath: "/portfolio/hair/hair3.jpeg"
  },
  {
    id: "hair-04",
    title: "Traditional Braid with Gajra",
    description: "A sleek, long traditional braid wrapped completely in a heavy, fragrant fresh gajra network.",
    imagePath: "/portfolio/hair/hair4.jpeg"
  },
  {
    id: "hair-05",
    title: "Soft Messy Updo",
    description: "An effortless, romantically styled messy updo with loose front tendrils, ideal for Haldi/Mehndi ceremonies.",
    imagePath: "/portfolio/hair/hair5.jpeg"
  },
  {
    id: "hair-06",
    title: "Classic Sleek Pony",
    description: "High-fashion, sleek wrapped ponytail with front partition calibration for camera clarity.",
    imagePath: "/portfolio/hair/hair6.jpeg"
  }
];

export const standaloneReels: StandaloneReel[] = [
  {
    id: "reel-02",
    videoPath: "/portfolio/new2.mp4",
    title: "Classic Henna Flow",
    category: "Reels"
  },
  {
    id: "reel-03",
    videoPath: "/portfolio/new3.mp4",
    title: "Bridal Reveal Sparkle",
    category: "Reels"
  },
  {
    id: "reel-04",
    videoPath: "/portfolio/new4.mp4",
    title: "Detailed Craftsmanship",
    category: "Reels"
  },
  {
    id: "reel-05",
    videoPath: "/portfolio/new5.mp4",
    title: "Royal Bride Showcase",
    category: "Reels"
  }
];
