/** Shape returned by form actions for useActionState. */
export type ActionState = {
  ok: boolean;
  message?: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
  /** Submitted values to restore, since React resets the form after an action. */
  values?: Record<string, string>;
  /** A one-time link for the admin to pass on when it could not be emailed. */
  link?: string;
} | null;
