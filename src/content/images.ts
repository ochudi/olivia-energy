import type { NewPhotoKey } from "@/types/contracts";

/**
 * Editorial photography shipped with the site (public/images). Every entry
 * carries its intrinsic size and a tiny blur placeholder so next/image can
 * reserve space and paint something before the file arrives. Sources and
 * licences are listed in public/images/CREDITS.md (Unsplash License: free
 * to use, no attribution required; the photographers are credited anyway).
 */
export type SitePhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Short, factual caption for figures; not shown on covers. */
  caption: string;
  /** Photographer, for the credits line where a figure shows one. */
  credit: string;
  blurDataURL: string;
};

/**
 * The twelve photographs added in the October 2026 rebuild
 * (public/images/photos). Every one is cropped and colour-graded by
 * scripts/grade-photos.mjs, which also writes the sizes, focal points and blur
 * placeholders below to public/images/photos/manifest.json. `focal` is an
 * object-position value. Captions state only what the source page states.
 */
export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL: string;
  caption: string;
  credit: {
    author: string;
    licence: string;
    licenceUrl?: string;
    sourceUrl: string;
    adapted: boolean;
  };
  focal?: string;
  variants?: {
    phone?: { src: string; width: number; height: number };
    desktop?: { src: string; width: number; height: number };
  };
};

export const PHOTOS = {
  coverDownstream: {
    src: "/images/cover-nigeria-downstream.jpg",
    width: 1520,
    height: 1013,
    alt: "A fuel tanker on a busy Nigerian road, with cars and traders alongside.",
    caption: "Tanker on the Ibadan road",
    credit: "Fahd Aminu",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAwDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAHhAAAQQBBQAAAAAAAAAAAAAAAQACAxESEyExQsH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AMBZDGMXRah6kvoj1TFMJBjPN1kdkREq/9k=",
  },
  coverSolar: {
    src: "/images/cover-commercial-solar.jpg",
    width: 1920,
    height: 1280,
    alt: "Rows of ground-mounted solar panels catching low afternoon sun.",
    caption: "Ground-mounted solar array",
    credit: "Vlad Burac",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAwDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAeEAACAgICAwAAAAAAAAAAAAABAgAEAxEFMRMhQf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAWEQEBAQAAAAAAAAAAAAAAAAABAAL/2gAMAwEAAhEDEQA/AJ9S9Z8qjLndR17bUptyaKdLYykfCG7iIOmQC//Z",
  },
  coverPower: {
    src: "/images/cover-power-demand.jpg",
    width: 1920,
    height: 1280,
    alt: "A high-voltage substation at dusk under sodium lighting.",
    caption: "Substation at dusk",
    credit: "American Public Power Association",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAwDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMG/8QAHhAAAQMEAwAAAAAAAAAAAAAAAgABAwQREyEFMUH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAGREBAAIDAAAAAAAAAAAAAAAAAQACERMU/9oADAMBAAIRAxEAPwDMUvFhNDkzw262e1KSkiA3FjAresTIiPRYUj1mJ//Z",
  },
  coverEsg: {
    src: "/images/cover-esg-flare.jpg",
    width: 1920,
    height: 1280,
    alt: "A gas flare burning above a hillside.",
    caption: "Gas flare",
    credit: "Odile",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAwDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAcEAADAAEFAAAAAAAAAAAAAAAAAQIDBBEhMXH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABgRAAIDAAAAAAAAAAAAAAAAAAABAgMS/9oADAMBAAIRAxEAPwC69kuJbSfZJWrxzTVOZ9YBKrJD5R//2Q==",
  },
  "lagos-third-mainland": {
    src: "/images/photos/lagos-third-mainland-16x9.jpg",
    width: 2400,
    height: 1350,
    alt: "A long, low silhouette of Third Mainland Bridge across the Lagos Lagoon under a coral-pink sunset sky, with still water below.",
    blurDataURL:
      "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADwAQCdASoQAAkAA4BaJbACdLoAAjMwrwAA/Yj1lEpF+pMiK92XsPZT+GQ/q7GZyOWgAA==",
    caption:
      "Third Mainland Bridge, Lagos, at sunset. Photo: Solasly, CC BY-SA 4.0",
    credit: {
      author: "Solasly",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Sunset_view_of_Third_Mailand_Bridge_from_Lagos_Lagoon.jpg",
      adapted: true,
    },
    focal: "60% 58%",
    variants: {
      phone: {
        src: "/images/photos/lagos-third-mainland-9x16.jpg",
        width: 1350,
        height: 2400,
      },
      desktop: {
        src: "/images/photos/lagos-third-mainland-16x9.jpg",
        width: 2400,
        height: 1350,
      },
    },
  },
  "tarfaya-wind": {
    src: "/images/photos/tarfaya-wind-4x5.jpg",
    width: 1594,
    height: 1993,
    alt: "Two white wind turbines rising from golden dunes under a deep blue sky.",
    blurDataURL:
      "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAwCdASoQABQALrV2u12jqampiYC0S2AE6ZQjgb0ABhAfDqUl3WMgAP6+Qrpx8ScYYlX525bEyBb/PHVXup8RY54tBVN2ll7wt36wvQtowu4Rhu3lIlFoAAA=",
    caption: "Tarfaya Wind Farm, Morocco. Photo: TEDxTarfaya, CC BY-SA 2.0",
    credit: {
      author: "TEDxTarfaya",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Tarfaya_Wind_Farm.jpg",
      adapted: true,
    },
    focal: "50% 35%",
  },
  "abuja-city-gate": {
    src: "/images/photos/abuja-city-gate-4x5.jpg",
    width: 1280,
    height: 1600,
    alt: "The setting sun, a bright yellow disc in a smoggy sky, above the silhouetted City Gate in Abuja.",
    blurDataURL:
      "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAABwAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JQBbZA9K2OZ0I3QAA/tAwMIEjV4nUV6lvZqfqX02y56QU2Ju+MInUrRXST4V1MAA=",
    caption: "City Gate, Abuja, at sunset. Photo: Baqeer Gashua, Unsplash",
    credit: {
      author: "Baqeer Gashua",
      licence: "Unsplash License",
      licenceUrl: "https://unsplash.com/license",
      sourceUrl: "https://unsplash.com/photos/pS7D8lroxTM",
      adapted: true,
    },
    focal: "40% 55%",
  },
  "bayelsa-flare": {
    src: "/images/photos/bayelsa-flare-4x5.jpg",
    width: 1799,
    height: 2249,
    alt: "A lattice flare stack with a small flame against a teal and gold sky, palms in silhouette and one large dark cloud.",
    blurDataURL:
      "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAABQBACdASoQABQAPu1mqk4ppaOiMAgBMB2JbACdMoADTsudrmCTQQdBFDmAAP4itBQFLxv7MONQbqSzAH2xumd9CiofY5MP+8IdB5++F8pDKz1uW5u4VN0/bxjIDAdzsxKAAA==",
    caption:
      "Gas flare at Obunagha, Bayelsa State, at dawn. Photo: OgbuefiPascal, CC BY-SA 4.0",
    credit: {
      author: "OgbuefiPascal",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Climate_and_weather_in_Nigeria_17.jpg",
      adapted: true,
    },
    focal: "35% 62%",
  },
  "lagos-market": {
    src: "/images/photos/lagos-market-4x5.jpg",
    width: 1920,
    height: 2400,
    alt: "A Lagos street market seen from directly above, with umbrellas, a yellow bus and a line of cars along the road.",
    blurDataURL:
      "data:image/webp;base64,UklGRsAAAABXRUJQVlA4ILQAAACQBACdASoQABQAPu1iqU2ppaOiMAgBMB2JbACdMoMnJ0fpUaWs7tzX/JeAsQAA/sHLGojd3PkxLEXkczW4btVyKwVzLIJKTxuc4gjbtc5s/WCQMx+Ff8es7g1Zv+PUIMJCgwPgLrUtPwXIKbq2KWm3prB4fEV6LtLvWO+opHd0ladGYr4w11kx1CbocMk9kZlo96vuWcRXTCTbZrV/t4kSJiwc3jwkkA0dxY20s/ThYx/YcAA=",
    caption: "Street market, Lagos, from above. Photo: Fahd Aminu, Unsplash",
    credit: {
      author: "Fahd Aminu",
      licence: "Unsplash License",
      licenceUrl: "https://unsplash.com/license",
      sourceUrl: "https://unsplash.com/photos/IWMQ5P9HxYM",
      adapted: true,
    },
    focal: "50% 0%",
  },
  "lecture-hall": {
    src: "/images/photos/lecture-hall-4x5.jpg",
    width: 1287,
    height: 1609,
    alt: "A lecture hall seen from the side, with an audience in the rows and a warm red-brown wall behind the stage.",
    blurDataURL:
      "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAACwAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JbACsABsBiDEiOASggAD+HrT1UmGsZfLVvGZskAujydX1vyVijAZZEwWXsqbMx+D7X1rvrhGM/SIBZVsyzQbl4NxJ0JHYAAA=",
    caption: "Lecture hall. Photo: Henry Storck, Unsplash",
    credit: {
      author: "Henry Storck",
      licence: "Unsplash License",
      licenceUrl: "https://unsplash.com/license",
      sourceUrl: "https://unsplash.com/photos/xJdnmZgczfA",
      adapted: true,
    },
    focal: "70% 50%",
  },
  "ethiopia-lineman": {
    src: "/images/photos/ethiopia-lineman-4x5.jpg",
    width: 1156,
    height: 1445,
    alt: "A lineman in a hard hat and harness walking along a bundle of conductors under a heavy cloud sky.",
    blurDataURL:
      "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAABwAwCdASoQABQAPu1iqU2ppaQiMAgBMB2JQBYdhDiKAPl5FkAA/I01LAIRzNuGcQ1lDRIwUe1pEGhuvrmJv/AFe+pT9trW4AAAAA==",
    caption:
      "A lineman on the Ethiopia to Kenya interconnector, Ethiopia. Photo: Rod Waddington, CC BY-SA 2.0",
    credit: {
      author: "Rod Waddington",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Ethiopia-Kenya_HVDC_Interconnector,_Lineman_in_Ethiopia.jpg",
      adapted: true,
    },
    focal: "45% 45%",
  },
  "lagos-lekki-night": {
    src: "/images/photos/lagos-lekki-night-16x9.jpg",
    width: 2400,
    height: 1350,
    alt: "The Lekki-Ikoyi Link Bridge in Lagos at night, its cables lit green and gold and reflected in dark water.",
    blurDataURL:
      "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACwAQCdASoQAAkAA4BaJZwAAudc5uw4AP74Tpg86yoGivVc/yGhTVw+aTn8fAAA",
    caption: "Lekki-Ikoyi Link Bridge, Lagos. Photo: Opeyemi Adisa, Unsplash",
    credit: {
      author: "Opeyemi Adisa",
      licence: "Unsplash License",
      licenceUrl: "https://unsplash.com/license",
      sourceUrl: "https://unsplash.com/photos/Ww2j734hEcA",
      adapted: true,
    },
    focal: "70% 60%",
  },
  "abuja-lightpoles": {
    src: "/images/photos/abuja-lightpoles-21x9.jpg",
    width: 1600,
    height: 686,
    alt: "Tall street lamps in silhouette against a deep orange sky, with the sun on the horizon.",
    blurDataURL:
      "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAADQAQCdASoQAAcAA4BaJbACdADHLsfOAAD+72WTEUxkhpBcYmE6NZFzHgztXKX3CmnuF7RkMX5x0bVN9jLpzkX3W1uQAA==",
    caption: "Street lights at sunset, Abuja. Photo: Habila Mazawaje, Unsplash",
    credit: {
      author: "Habila Mazawaje",
      licence: "Unsplash License",
      licenceUrl: "https://unsplash.com/license",
      sourceUrl: "https://unsplash.com/photos/EFPHs59BiT8",
      adapted: true,
    },
    focal: "50% 72%",
    variants: {
      phone: {
        src: "/images/photos/abuja-lightpoles-4x5.jpg",
        width: 1600,
        height: 2000,
      },
      desktop: {
        src: "/images/photos/abuja-lightpoles-21x9.jpg",
        width: 1600,
        height: 686,
      },
    },
  },
  "bonny-night": {
    src: "/images/photos/bonny-night-3x2.jpg",
    width: 2220,
    height: 1480,
    alt: "A gas plant on the Rivers State coast at night, a flare burning above glowing steam, the plant lights reflected in dark water.",
    blurDataURL:
      "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAwAgCdASoQAAsAA4BaJZgCdAEPAG3fcmQYAAD++RcZJnkqlqFOdVmlcNrSAkYA2mElq900M/s8uuOHaYLv1YeusVyalS7+pwoG4AAA",
    caption:
      "Gas plant at night, Rivers State. Photo: ---=XEON=--- (Panoramio), CC BY 3.0",
    credit: {
      author: "---=XEON=--- (Panoramio)",
      licence: "CC BY 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by/3.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Night_Factory_-_panoramio.jpg",
      adapted: true,
    },
    focal: "50% 50%",
  },
  "noor-solar": {
    src: "/images/photos/noor-solar-3x2.jpg",
    width: 1440,
    height: 960,
    alt: "The Noor III solar tower with its receiver glowing amber against a dusk sky, the heliostat field in silhouette below.",
    blurDataURL:
      "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoQAAsAA4BaJZACdADWeAmAAAD+Mo3+Iq77L7WG2l0xBgs5XjwtD9/VY44FUySY0WCn3EYn34AAAA==",
    caption:
      "Noor III solar tower, Ouarzazate, Morocco. Photo: Marc Lacoste, CC BY-SA 4.0",
    credit: {
      author: "Marc Lacoste",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Ouarzazate_Power_Station_Noor_III_Solar_Tower.jpg",
      adapted: true,
    },
    focal: "70% 50%",
  },
  "nanyuki-pylon": {
    src: "/images/photos/nanyuki-pylon-3x2.jpg",
    width: 2400,
    height: 1600,
    alt: "A steel lattice transmission tower against dusk clouds lit peach from below, with a pale moon at the upper left.",
    blurDataURL:
      "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoQAAsAA4BaJZgCdADpzqG8SgAA/I7b+oylNw+scoFthZ0oqYRgUM5JKgNklnqStdey8xWWrzsFTBXuLtIidG9Bv3H9guU1QAA=",
    caption:
      "Transmission tower, Nanyuki, Kenya. Photo: Emmanuel Wambugu, Unsplash",
    credit: {
      author: "Emmanuel Wambugu",
      licence: "Unsplash License",
      licenceUrl: "https://unsplash.com/license",
      sourceUrl: "https://unsplash.com/photos/bAsbiRTaBK4",
      adapted: true,
    },
    focal: "60% 50%",
  },
} as const satisfies Record<string, SitePhoto | Photo>;

/**
 * The founder's two portraits, supplied by Dr Olugbenga Olaoye (not stock, so
 * not in PHOTOS and not graded). scripts/portraits.mjs crops each to a square
 * with the head centred, for the circle the page frames it in; next/image
 * serves the AVIF and WebP sizes. The suit portrait is the founder's
 * everywhere (Home, the article author card, structured data); the academic
 * one sits beside the credentials on About.
 */
export type Portrait = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** The credits line for /credits. */
  credit: string;
};

const PORTRAIT_CREDIT = "Portrait supplied by Dr Olugbenga Olaoye";

export const PORTRAITS = {
  suit: {
    src: "/founder/olugbenga-olaoye-suit.jpg",
    width: 1120,
    height: 1120,
    alt: "Dr Olugbenga Olaoye in a black suit, white shirt and red tie, with short dark hair and a grey beard, smiling gently at the camera.",
    credit: PORTRAIT_CREDIT,
  },
  academic: {
    src: "/founder/olugbenga-olaoye-academic.jpg",
    width: 1120,
    height: 1120,
    alt: "Dr Olugbenga Olaoye in doctoral academic dress: a green velvet cap edged in red with a red tassel, and a maroon gown with green and purple facings.",
    credit: PORTRAIT_CREDIT,
  },
} as const satisfies Record<string, Portrait>;

export type PhotoKey = keyof typeof PHOTOS;

/** Fails the typecheck if a key in the shared contract has no entry above. */
export type NewPhoto = (typeof PHOTOS)[NewPhotoKey];
