import { pluralClicks } from "@/lib/format";

export function challengeShareText(start: string, target: string) {
  return `Can you connect ${start} to ${target}?\n\nSpeedWikipedia`;
}

export function resultShareText(input: {
  start: string;
  target: string;
  clicks: number;
  timeMs: number;
}) {
  const seconds = (Math.max(0, input.timeMs) / 1000).toFixed(1);
  return `I connected ${input.start} to ${input.target} in ${pluralClicks(input.clicks)} (${seconds}s).\n\nCan you beat me?\nSpeedWikipedia`;
}

export function shareLinks(text: string, url: string) {
  const full = `${text}\n${url}`;
  return [
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(full)}` },
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ];
}
