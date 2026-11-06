/**
 * Contact page copy (creative brief 4.7). Addresses, phones, the email and
 * social links come from settings (src/lib/supabase/types.ts); this file
 * holds the page furniture and the form's states. The form's labels, help
 * text, validation messages and success message are unchanged.
 */
export const CONTACT_PAGE = {
  /** Red hero with the dotted Africa map. */
  hero: {
    title: "Start a conversation.",
    lede: "Governments need evidence. Investors require clarity. Tell us what you are working on, and we will be in touch.",
    /** Beside the ring that marks the region (a region, not a town). */
    mapLabel: "Southwest Nigeria",
    /** Under the map, as separate text. The map itself is decorative (`alt=""`). */
    mapSecondary: "And in Fort Worth, Texas, United States",
  },
  /** Details column beside the form. */
  details: {
    email: "Email",
    where: "Where we are",
    /** Shown when settings carry no city-level addresses. */
    whereLines: ["Fort Worth, Texas, United States", "Southwest Nigeria"],
    company: "Company",
    companyLines: ["Olivia Energy and Power Company Limited", "RC 1662525"],
  },
  form: {
    /** The form card's heading (h2). */
    title: "Send a message",
    intro:
      "Tell us about your organisation and the question you are working on.",
    name: "Name",
    email: "Email",
    organization: "Organisation",
    optional: "Optional",
    message: "Message",
    messageHint: "What is the decision, and when does it need to be made?",
    submit: "Send message",
    sending: "Sending…",
    privacy:
      "We use your details only to reply. This form is protected by Cloudflare Turnstile.",
    privacyLink: { label: "How we handle your information", href: "/privacy" },
  },
  success: {
    title: "Thank you. Your message is with us.",
    body: (email: string) =>
      `We reply by email, from ${email}. If it cannot wait, write to that address directly.`,
    again: "Send another message",
  },
  errors: {
    invalid: "Check the highlighted fields.",
    turnstile:
      "We could not confirm that you are a person. Please try once more.",
    turnstilePending:
      "Verification is still running. Give it a moment and try again.",
    turnstileError: (email: string) =>
      `The verification step failed. Please reload the page and try again, or email us at ${email}.`,
    turnstileLoad: (email: string) =>
      `The verification step could not load, often because of a content blocker. Please email us instead at ${email}.`,
    rateLimited: (email: string) =>
      `You have sent several messages in the last hour. Please wait a while, or email us directly at ${email}.`,
    server: (email: string) =>
      `Your message did not go through. Please try again, or email us at ${email}.`,
    unconfigured: (email: string) =>
      `The form is not available right now. Please email us at ${email}.`,
  },
} as const;
