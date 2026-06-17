import type { Bubble, BubbleGroup } from "./types";

export function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(date);
}

export function groupBubblesByDate(bubbles: Bubble[]) {
  return bubbles.reduce<BubbleGroup[]>((groups, bubble) => {
    const label = formatDate(bubble.createdAt);
    const current = groups.at(-1);

    if (current?.label === label) {
      current.items.push(bubble);
    } else {
      groups.push({ label, items: [bubble] });
    }

    return groups;
  }, []);
}
