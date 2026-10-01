"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

type Props = Omit<Extract<ButtonProps, { href?: undefined }>, "children"> & {
  children: React.ReactNode;
  pendingLabel?: string;
};

/** A form submit that shows its pending state. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  ...props
}: Props) {
  const { pending } = useFormStatus();
  return (
    <Button
      {...props}
      type="submit"
      size={props.size ?? "sm"}
      disabled={pending || props.disabled}
      aria-busy={pending || undefined}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
