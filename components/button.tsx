import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

const variants = {
  primary:
    "border border-accent bg-accent text-accent-ink shadow-[0_1px_0_rgb(0_0_0/10%)] hover:opacity-90",
  secondary:
    "border border-line bg-card text-ink shadow-[0_1px_0_rgb(0_0_0/6%)] hover:bg-soft hover:border-[color-mix(in_srgb,var(--ink)_28%,var(--line))]",
  ghost:
    "border border-line bg-card/60 text-ink shadow-[0_1px_0_rgb(0_0_0/4%)] hover:bg-card",
};

const base =
  "pressable inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
