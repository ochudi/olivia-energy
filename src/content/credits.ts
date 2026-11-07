import type {
  FactId,
  NewPhotoKey,
  SeriesId,
  SourceRef,
} from "@/types/contracts";
import { PHOTOS, PORTRAITS } from "./images";

/**
 * Copy and rows for /credits. Photograph rows are built from PHOTOS, so an
 * author, licence or source page is written in one place only.
 */

/** Page copy. */
export const CREDITS_PAGE = {
  title: "Credits",
  lede: "The photographs, data and typefaces on this site, with their authors and licences.",
  photographs: {
    title: "Photographs",
    columns: {
      image: "Image",
      place: "Place",
      author: "Author",
      licence: "Licence",
      source: "Source page",
      changes: "Changes",
    },
    sourceLinkLabel: "Source page",
    changed: "Cropped and colour-graded",
    portraitsNote:
      "Cropped to a square, resized and lightly sharpened; the colours are as supplied.",
  },
  data: { title: "Data" },
  map: { title: "Map" },
  typefaces: { title: "Typefaces" },
  closingNote:
    "Adapted versions of photographs licensed CC BY-SA are shared under the same licence.",
} as const;

export type PhotoCredit = {
  key: string;
  /** What the picture shows, short. */
  image: string;
  /** Where it was taken, as the source page states it. */
  place: string;
  author: string;
  licence: string;
  licenceUrl?: string;
  sourceUrl: string;
  /** "Cropped and colour-graded" is shown only where true. */
  graded: boolean;
  /** Shipped before the rebuild (the starter articles and old pages). */
  legacy: boolean;
};

const NEW_PHOTO_ROWS: Record<NewPhotoKey, { image: string; place: string }> = {
  "lagos-third-mainland": {
    image: "Third Mainland Bridge at sunset",
    place: "Lagos, Nigeria",
  },
  "tarfaya-wind": { image: "Tarfaya Wind Farm", place: "Tarfaya, Morocco" },
  "abuja-city-gate": { image: "City Gate at sunset", place: "Abuja, Nigeria" },
  "bayelsa-flare": {
    image: "Gas flare at dawn",
    place: "Obunagha, Bayelsa State, Nigeria",
  },
  "lagos-market": {
    image: "Street market from above",
    place: "Lagos, Nigeria",
  },
  "lecture-hall": { image: "Lecture hall", place: "Not stated by the source" },
  "ethiopia-lineman": {
    image: "Lineman on the Ethiopia to Kenya interconnector",
    place: "Ethiopia",
  },
  "lagos-lekki-night": {
    image: "Lekki-Ikoyi Link Bridge at night",
    place: "Lagos, Nigeria",
  },
  "abuja-lightpoles": {
    image: "Street lights at sunset",
    place: "Abuja, Nigeria",
  },
  "bonny-night": {
    image: "Gas plant at night",
    place: "Rivers State, Nigeria",
  },
  "noor-solar": { image: "Noor III solar tower", place: "Ouarzazate, Morocco" },
  "nanyuki-pylon": { image: "Transmission tower", place: "Nanyuki, Kenya" },
};

const NEW_PHOTO_ORDER = Object.keys(NEW_PHOTO_ROWS) as NewPhotoKey[];

const UNSPLASH = "https://unsplash.com/license";

/** Photographs that shipped before the rebuild (Unsplash License; see public/images/CREDITS.md). */
const LEGACY_PHOTO_CREDITS: readonly PhotoCredit[] = [
  {
    key: "coverDownstream",
    image: "Tanker on the Ibadan road",
    place: "Ibadan road, Nigeria",
    author: "Fahd Aminu",
    licence: "Unsplash License",
    licenceUrl: UNSPLASH,
    sourceUrl:
      "https://unsplash.com/photos/a-parking-lot-full-of-cars-and-trucks-AoyzJubF-xk",
    graded: false,
    legacy: true,
  },
  {
    key: "coverSolar",
    image: "Ground-mounted solar array",
    place: "Not stated by the source",
    author: "Vlad Burac",
    licence: "Unsplash License",
    licenceUrl: UNSPLASH,
    sourceUrl:
      "https://unsplash.com/photos/expansive-solar-panel-farm-under-a-clear-blue-sky-CVjxkBW22fU",
    graded: false,
    legacy: true,
  },
  {
    key: "coverPower",
    image: "Substation at dusk",
    place: "Not stated by the source",
    author: "American Public Power Association",
    licence: "Unsplash License",
    licenceUrl: UNSPLASH,
    sourceUrl:
      "https://unsplash.com/photos/green-and-grey-transmission-tower-during-nighttime-AA5v6sMcalY",
    graded: false,
    legacy: true,
  },
  {
    key: "coverEsg",
    image: "Gas flare",
    place: "Not stated by the source",
    author: "Odile",
    licence: "Unsplash License",
    licenceUrl: UNSPLASH,
    sourceUrl:
      "https://unsplash.com/photos/a-flare-burns-brightly-from-a-tower-j4UCo3x3h8c",
    graded: false,
    legacy: true,
  },
];

/** Every photograph, the twelve new ones first (all cropped and colour-graded). */
export const PHOTO_CREDITS: readonly PhotoCredit[] = [
  ...NEW_PHOTO_ORDER.map((key): PhotoCredit => {
    const { credit } = PHOTOS[key];
    return {
      key,
      ...NEW_PHOTO_ROWS[key],
      author: credit.author,
      licence: credit.licence,
      licenceUrl: credit.licenceUrl,
      sourceUrl: credit.sourceUrl,
      graded: credit.adapted,
      legacy: false,
    };
  }),
  ...LEGACY_PHOTO_CREDITS,
];

/** The founder's portraits: supplied by him, so no source page or licence row. */
export const PORTRAIT_CREDITS = [
  { key: "suit", image: "Dr Olugbenga Olaoye in a suit" },
  { key: "academic", image: "Dr Olugbenga Olaoye in academic attire" },
].map(({ key, image }) => ({
  key,
  image,
  credit: PORTRAITS[key as keyof typeof PORTRAITS].credit,
}));

export type DataCredit =
  | {
      kind: "series";
      id: SeriesId;
      source: SourceRef;
      /** ISO date the file was retrieved. */
      retrieved: string;
    }
  | {
      kind: "fact";
      /** The verified figures that cite this document. */
      facts: readonly FactId[];
      source: SourceRef;
      /** ISO date the figures were checked against the document. */
      retrieved: string;
    };

/**
 * Every series file and every document behind a verified figure. Series
 * licences are as recorded in src/content/data/series; a fact source states
 * no licence because the figures are quoted, not redistributed.
 */
export const DATA_CREDITS: readonly DataCredit[] = [
  {
    kind: "series",
    id: "electricity_access_pct",
    source: {
      org: "World Bank (WDI EG.ELC.ACCS.ZS)",
      title: "Access to electricity, % of population",
      url: "https://api.worldbank.org/v2/country/NGA;SSF;WLD/indicator/EG.ELC.ACCS.ZS?format=json&per_page=500&date=2000:2026",
      licence: "CC BY 4.0 (World Bank Open Data)",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "people_without_electricity",
    source: {
      org: "Our World in Data from World Bank",
      title: "Number of people without access to electricity",
      url: "https://ourworldindata.org/grapher/people-without-electricity-country.csv?v=1&csvType=full&useColumnShortNames=true",
      licence:
        "CC BY 4.0 (Our World in Data); underlying data World Bank CC BY 4.0",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "solar_pv_capacity_gw",
    source: {
      org: "Our World in Data from IRENA (2026)",
      title: "Installed solar PV capacity",
      url: "https://ourworldindata.org/grapher/installed-solar-pv-capacity.csv?v=1&csvType=full&useColumnShortNames=true",
      licence: "CC BY 4.0 (Our World in Data); underlying data IRENA",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "solar_pv_module_price",
    source: {
      org: "Our World in Data from IRENA (2025), Nemet (2009), Farmer and Lafond (2016)",
      title: "Solar photovoltaic module price",
      url: "https://ourworldindata.org/grapher/solar-pv-prices.csv?v=1&csvType=full&useColumnShortNames=true",
      licence:
        "CC BY 4.0 (Our World in Data); underlying data IRENA/Nemet/Farmer and Lafond",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "generation_by_source_nigeria",
    source: {
      org: "Our World in Data from Ember (2026)",
      title: "Electricity generation by source, Nigeria",
      url: "https://ourworldindata.org/grapher/electricity-prod-source-stacked.csv?v=1&csvType=full&useColumnShortNames=true",
      licence: "CC BY 4.0 (Our World in Data); underlying data Ember CC BY 4.0",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "generation_by_source_africa",
    source: {
      org: "Our World in Data from Ember (2026)",
      title:
        "Electricity generation by source, Africa (Ember region definition)",
      url: "https://ourworldindata.org/grapher/electricity-prod-source-stacked.csv?v=1&csvType=full&useColumnShortNames=true",
      licence: "CC BY 4.0 (Our World in Data); underlying data Ember CC BY 4.0",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "low_carbon_share_electricity",
    source: {
      org: "Our World in Data from Ember (2026)",
      title: "Share of electricity generation from low-carbon sources",
      url: "https://ourworldindata.org/grapher/share-electricity-low-carbon.csv?v=1&csvType=full&useColumnShortNames=true",
      licence: "CC BY 4.0 (Our World in Data); underlying data Ember CC BY 4.0",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "co2_per_capita",
    source: {
      org: "Our World in Data from Global Carbon Budget (2025)",
      title: "CO2 emissions per capita",
      url: "https://ourworldindata.org/grapher/co-emissions-per-capita.csv?v=1&csvType=full&useColumnShortNames=true",
      licence:
        "CC BY 4.0 (Our World in Data); underlying data Global Carbon Project CC BY 4.0",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "temperature_anomaly",
    source: {
      org: "NASA GISS GISTEMP v4",
      title: "Global surface temperature anomaly, mean for each calendar year",
      url: "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv",
      licence: "NASA GISS open data",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "brent_crude_annual",
    source: {
      org: "US EIA series RBRTE",
      title: "Brent crude oil spot price, average for each year",
      url: "https://www.eia.gov/dnav/pet/hist_xls/RBRTEa.xls",
      licence: "US Government work, public domain",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "brent_crude_monthly",
    source: {
      org: "US EIA series RBRTE",
      title: "Brent crude oil spot price, average for each month",
      url: "https://www.eia.gov/dnav/pet/hist_xls/RBRTEm.xls",
      licence: "US Government work, public domain",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "energy_per_person",
    source: {
      org: "Our World in Data from Energy Institute Statistical Review (2026)",
      title: "Primary energy use per person (total energy supply)",
      url: "https://ourworldindata.org/grapher/per-capita-energy-use.csv?v=1&csvType=full&useColumnShortNames=true",
      licence:
        "CC BY 4.0 (Our World in Data); underlying data Energy Institute",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "series",
    id: "electricity_per_person",
    source: {
      org: "Our World in Data from Ember (2026)",
      title: "Electricity generation per person",
      url: "https://ourworldindata.org/grapher/per-capita-electricity-generation.csv?v=1&csvType=full&useColumnShortNames=true",
      licence: "CC BY 4.0 (Our World in Data); underlying data Ember CC BY 4.0",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["ssa-no-electricity-2024", "world-no-electricity-2024"],
    source: {
      org: "UN Statistics Division",
      title: "SDG Extended Report 2026, Goal 7",
      url: "https://unstats.un.org/sdgs/report/2026/extended-report/Extended-Report-2026_Goal-7.pdf",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["nigeria-no-electricity-2024", "africa-no-clean-cooking-2024"],
    source: {
      org: "Sustainable Energy for All",
      title:
        "Tracking SDG7: The Energy Progress Report 2026, executive version",
      url: "https://www.seforall.org/system/files/2026-07/SEforALL%20Tracking%20SDG7%20-%20The%20Energy%20Progress%20Report%202026_Executive%20Version_22Jul2026-2.pdf",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["clean-cooking-half-of-two-billion-in-africa"],
    source: {
      org: "International Energy Agency",
      title: "Clean cooking in Africa 2026, executive summary",
      url: "https://www.iea.org/reports/clean-cooking-in-africa-2026/executive-summary",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: [
      "africa-clean-investment-share-vs-population",
      "africa-energy-investment-fall-debt",
    ],
    source: {
      org: "International Energy Agency",
      title: "World Energy Investment 2025, executive summary",
      url: "https://www.iea.org/reports/world-energy-investment-2025/executive-summary",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["africa-solar-resource-share"],
    source: {
      org: "International Energy Agency",
      title: "Africa Energy Outlook 2022, key findings",
      url: "https://www.iea.org/reports/africa-energy-outlook-2022/key-findings",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["africa-solar-pv-installed-2025"],
    source: {
      org: "IRENA",
      title: "Renewable capacity statistics 2026",
      url: "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2026/Mar/IRENA_DAT_RE_capacity_statistics_2026.pdf",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: [
      "nigeria-grid-installed-vs-available-q1-2026",
      "nigeria-grid-delivered-q1-2026",
    ],
    source: {
      org: "Nigerian Electricity Regulatory Commission",
      title: "2026 Q1 report",
      url: "https://nerc.gov.ng/wp-content/uploads/2026/07/2026_Q1-Report.pdf",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: [
      "nigeria-business-generators",
      "nigeria-grid-unavailable-and-losses",
    ],
    source: {
      org: "IFC / World Bank Group",
      title: "Nigeria Country Private Sector Diagnostic",
      url: "https://www.ifc.org/content/dam/ifc/doc/2025/nigeria-country-private-sector-diagnostic-en.pdf",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: [
      "nigeria-flaring-rank-2025",
      "nigeria-flaring-rise-2025",
      "global-flaring-2025",
    ],
    source: {
      org: "World Bank, Global Flaring and Methane Reduction Partnership",
      title: "Global Gas Flaring Tracker Report, June 2026",
      url: "https://documents1.worldbank.org/curated/en/099071626222036730/pdf/P507104-60bded2c-d259-4881-a42f-d24e983b3eca.pdf",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["dangote-nameplate-2026"],
    source: {
      org: "Hydrocarbon Processing",
      title:
        "Nigeria’s Dangote refinery to begin full capacity tests in February, 4 February 2026",
      url: "https://hydrocarbonprocessing.com/news/2026/02/nigeria-s-dangote-refinery-to-begin-full-capacity-tests-in-february/",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: [
      "dangote-capacity-700k-eia-2026",
      "nigeria-product-exports-sevenfold-2026",
    ],
    source: {
      org: "U.S. Energy Information Administration",
      title: "Today in Energy, 24 August 2026",
      url: "https://www.eia.gov/todayinenergy/detail.php?id=68004",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: [
      "nigeria-net-zero-2060-etp-cost",
      "nigeria-etp-original-410bn",
      "nigeria-power-2060-277gw",
    ],
    source: {
      org: "Nigeria Energy Transition Plan, hosted by Sustainable Energy for All",
      title: "Nigeria Energy Transition Plan, ETIP update (November 2024)",
      url: "https://www.seforall.org/system/files/2025-05/Nigeria-ETIP-u.pdf",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["clean-vs-fossil-investment-2026"],
    source: {
      org: "International Energy Agency",
      title: "World Energy Investment 2026, regional dashboards",
      url: "https://www.iea.org/reports/world-energy-investment-2026/regional-dashboards",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["solar-pv-cost-fall-since-2010"],
    source: {
      org: "IRENA",
      title: "Renewable power generation costs in 2025, executive summary",
      url: "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2026/Jul/IRENA_TEC_RPGC_2025_Executive_summary_2026.pdf",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["record-renewable-additions-2025-africa"],
    source: {
      org: "IRENA",
      title: "Press release, April 2026",
      url: "https://www.irena.org/News/pressreleases/2026/Apr/Near-700-GW-Surge-in-2025-Proves-Renewable-Energy-Resilience",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["global-temperature-2025"],
    source: {
      org: "Copernicus Climate Change Service (ECMWF)",
      title: "2025 was the third-hottest year on record",
      url: "https://climate.copernicus.eu/copernicus-2025-was-third-hottest-year-record",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["energy-co2-2025"],
    source: {
      org: "International Energy Agency",
      title: "Global Energy Review 2026, CO2 emissions",
      url: "https://www.iea.org/reports/global-energy-review-2026/co2-emissions",
    },
    retrieved: "2026-10-02",
  },
  {
    kind: "fact",
    facts: ["ssa-population-growth-2054"],
    source: {
      org: "United Nations Department of Economic and Social Affairs, Population Division",
      title: "World Population Prospects 2024, summary of results",
      url: "https://population.un.org/wpp/assets/Files/WPP2024_Summary-of-Results.pdf",
    },
    retrieved: "2026-10-02",
  },
];

/** Map credit. */
export const MAP_CREDIT = {
  text: "Africa outline from Natural Earth, public domain",
  source: {
    org: "Natural Earth",
    title: "Africa outline",
    url: "https://www.naturalearthdata.com/about/terms-of-use/",
    licence: "Public domain",
  },
} as const satisfies { text: string; source: SourceRef };

/**
 * Typefaces. `designers` is exactly what the font file's own copyright
 * metadata says (src/assets/fonts/*.ttf, name table id 0); no individual
 * designers are named because the metadata names the project authors.
 */
export const FONT_CREDITS = [
  {
    name: "Newsreader",
    designers: "The Newsreader Project Authors",
    copyright: "Copyright 2020 The Newsreader Project Authors",
    url: "http://github.com/productiontype/Newsreader",
    licence: "SIL Open Font License",
    licenceUrl: "https://scripts.sil.org/OFL",
  },
  {
    name: "Instrument Sans",
    designers: "The Instrument Sans Project Authors",
    copyright: "Copyright 2022 The Instrument Sans Project Authors",
    url: "https://github.com/Instrument/instrument-sans",
    licence: "SIL Open Font License",
    licenceUrl: "https://scripts.sil.org/OFL",
  },
] as const;
