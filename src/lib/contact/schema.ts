import * as z from "zod/mini";

/**
 * Contact-form schema, shared by the client (inline messages before submit)
 * and the server action (the check that counts). Built on zod/mini so the
 * browser bundle carries a few kilobytes of validators rather than the
 * whole library. Limits mirror the contact_messages check constraints.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(2, "Please enter your name."),
      z.maxLength(120, "Keep your name under 120 characters."),
    ),
  email: z.pipe(
    z
      .string()
      .check(
        z.trim(),
        z.toLowerCase(),
        z.maxLength(254, "That email address is too long."),
      ),
    z.email("Enter a valid email address."),
  ),
  organization: z.pipe(
    z
      .string()
      .check(
        z.trim(),
        z.maxLength(160, "Keep the organisation under 160 characters."),
      ),
    z.transform((value) => value || null),
  ),
  message: z
    .string()
    .check(
      z.trim(),
      z.minLength(10, "Tell us a little more: at least a sentence."),
      z.maxLength(5000, "Keep the message under 5,000 characters."),
    ),
});

export type ContactValues = z.output<typeof contactSchema>;
export const CONTACT_FIELDS = [
  "name",
  "email",
  "organization",
  "message",
] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactErrors = Partial<Record<ContactField, string>>;

type IssueLike = { path: PropertyKey[]; message: string };

/** First message per field. */
export function fieldErrors(error: { issues: IssueLike[] }): ContactErrors {
  const errors: ContactErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && isContactField(field) && !errors[field])
      errors[field] = issue.message;
  }
  return errors;
}

function isContactField(value: string): value is ContactField {
  return (CONTACT_FIELDS as readonly string[]).includes(value);
}
