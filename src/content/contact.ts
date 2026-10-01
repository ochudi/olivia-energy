/**
 * Contact page copy. Addresses, phones, the email and social links come
 * from settings (src/lib/supabase/types.ts); this file holds the page
 * furniture and the form's states.
 */
export const CONTACT_PAGE = {
  eyebrow: "Contact",
  title: "Write to us.",
  /** Makes no promise about response time or fees. */
  invitation:
    "Whether you are weighing an investment, a licence, a market entry or a policy position, start with a short note on the question. We read every message and reply by email.",
  description:
    "Write to Olivia Energy about an investment, a licence, a market entry or a policy question. We work from Fort Worth, Texas, and Otta, Ogun State.",
  headings: {
    offices: "Offices",
    email: "Email",
    phone: "Phone",
    social: "Follow",
  },
  /**
   * Each office in Admin → Settings → addresses is listed with its lines
   * (city level: Fort Worth, Texas; Otta, Ogun State). If no office has
   * any lines, the page lists the countries instead, joined with this.
   */
  countrySeparator: " · ",
  form: {
    /** Visually hidden; names the form for assistive technology. */
    heading: "Send a message",
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
