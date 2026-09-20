import type { AnchorHTMLAttributes } from "react";
export function MalaysiaPrivateRfqLink({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props}>{children}</a>;
}
