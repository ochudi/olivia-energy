import { vi } from "vitest";

// `server-only` throws when imported outside a React Server environment;
// the modules under test carry it as a guard, not as behaviour.
vi.mock("server-only", () => ({}));
