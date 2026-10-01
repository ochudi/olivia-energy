/**
 * Privacy notice. Written for a company registered in Nigeria that receives
 * messages from the United States as well, so it follows the Nigeria Data
 * Protection Act 2023 and reads sensibly to a US visitor. Facts stated here
 * (what the form collects, which providers process it, that visitors get no
 * cookies) are true of the code; the client may edit the wording freely.
 */
export const PRIVACY = {
  eyebrow: "Privacy",
  title: "How we handle your information.",
  lede: "This site collects personal information in one place, the contact form, and uses it for one purpose, replying to you. This notice sets out what that involves.",
  updated: "29 September 2026",
  metadata: {
    title: "Privacy Notice | Olivia Energy",
    description:
      "What Olivia Energy collects through its website, why, who processes it, how long it is kept and the rights you have under the Nigeria Data Protection Act 2023.",
  },
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "Olivia Energy and Power Company Limited (RC 1662525), trading as Olivia Energy, is the controller of the personal information described here. Questions about this notice, and requests about your information, go to info@oliviaenergyandpower.com.",
      ],
    },
    {
      heading: "What we collect and why",
      paragraphs: [
        "When you use the contact form we receive the name, email address and message you type, and the organisation you name if you choose to give it. We use them to read your message, reply to it and follow up on the matter you raised. We do not use them for marketing and we do not sell or share them for advertising.",
        "We process this information because you asked us to respond, which is a legitimate interest we share with you, and by sending the form you consent to that use. The form is protected by Cloudflare Turnstile, which distinguishes people from automated traffic; to do so Cloudflare processes technical signals from your browser, including its network address, under its own privacy policy. We also limit how many messages one email address can send in an hour.",
      ],
    },
    {
      heading: "Who processes it",
      paragraphs: [
        "Messages are stored in our content database, which is hosted by Supabase, and a copy is emailed to us through Resend. The website runs on Vercel, which keeps short-lived server logs, including network addresses, for security and operation. Each of these providers acts on our instructions under a data processing agreement and holds the data outside Nigeria, in the United States or Europe, with the contractual safeguards those agreements provide.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "We keep a message for twelve months after our last exchange about it, then delete it. If we start working together, what you have told us becomes part of the engagement record and is kept under that agreement.",
      ],
    },
    {
      heading: "Cookies",
      paragraphs: [
        "The public pages of this site set no cookies and run no analytics or tracking, so a Do Not Track signal from your browser changes nothing. An article may embed a video or audio player from YouTube, Vimeo, Spotify or Apple Podcasts; that player loads only when you open the article and follows its provider’s own policy. The administration area, which only our staff can use, sets a sign-in cookie for the person signed in.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Under the Nigeria Data Protection Act 2023 you may ask what information we hold about you, ask us to correct or delete it, object to how we use it, or withdraw consent you have given. Write to the address above and we will respond. You may also complain to the Nigeria Data Protection Commission. If you write to us from elsewhere, the rights your own law gives you apply as well, and we will honour them.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "If we change how we handle personal information we will update this page and the date at the top of it.",
      ],
    },
  ],
} as const;
