import { describe, expect, it } from "vitest";
import { contactSchema, fieldErrors } from "./schema";

describe("contactSchema", () => {
  it("trims, lower-cases the email and turns a blank organisation into null", () => {
    const result = contactSchema.safeParse({
      name: "  Ada Okafor ",
      email: " Ada@Example.com ",
      organization: "   ",
      message: "  We are weighing a gas-to-power investment.  ",
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({
      name: "Ada Okafor",
      email: "ada@example.com",
      organization: null,
      message: "We are weighing a gas-to-power investment.",
    });
  });

  it("reports one readable message per invalid field", () => {
    const result = contactSchema.safeParse({
      name: "A",
      email: "not-an-email",
      organization: "x".repeat(161),
      message: "short",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(fieldErrors(result.error)).toEqual({
      name: "Please enter your name.",
      email: "Enter a valid email address.",
      organization: "Keep the organisation under 160 characters.",
      message: "Tell us a little more: at least a sentence.",
    });
  });

  it("caps the message at the database limit", () => {
    const result = contactSchema.safeParse({
      name: "Ada Okafor",
      email: "ada@example.com",
      organization: "",
      message: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});
