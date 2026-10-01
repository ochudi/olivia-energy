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

export const PHOTOS = {
  homeStory: {
    src: "/images/home-lagos-depot.jpg",
    width: 2400,
    height: 1500,
    alt: "Aerial view of a fuel storage depot at Ijora, Lagos, with the Third Mainland Bridge behind it.",
    caption: "Tank farm at Ijora, Lagos",
    credit: "Vitalis Nwenyi",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAwDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAGxAAAgMBAQEAAAAAAAAAAAAAAQIAAxEEMYH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABYRAQEBAAAAAAAAAAAAAAAAAAEAQf/aAAwDAQACEQMRAD8AsHNZUXdZVtxgD5Mjd7KxBtb42xEkWZf/2Q==",
  },
  aboutStory: {
    src: "/images/about-lagos-power.jpg",
    width: 2400,
    height: 1500,
    alt: "A disused power-station chimney above a congested Lagos expressway, with a substation beside it.",
    caption: "Ijora power station, Lagos",
    credit: "Vitalis Nwenyi",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAwDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAL/xAAcEAACAgMBAQAAAAAAAAAAAAABAgADBBFBBVH/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABYRAQEBAAAAAAAAAAAAAAAAAAEAEf/aAAwDAQACEQMRAD8AJ6eWybNrsD0clLmXuuxexH0HcRJqzwv/2Q==",
  },
  whatWeDoBand: {
    src: "/images/what-we-do-refinery-night.jpg",
    width: 2400,
    height: 1029,
    alt: "A refinery lit at night across the water, with tankers moored offshore.",
    caption: "Refinery and tankers at night",
    credit: "Chris LeBoutillier",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAFAAwDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQG/8QAHhAAAgEDBQAAAAAAAAAAAAAAAAEDAhESBDEyQaH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AMYlG9Im41nlyv0SOpX29AFH/9k=",
  },
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
} as const satisfies Record<string, SitePhoto>;

export type PhotoKey = keyof typeof PHOTOS;
