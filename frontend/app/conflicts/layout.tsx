import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conflicts - War Strategy",
  description: "Real-time monitoring of active military conflicts and their natural resources",
};

/**
 * Conflicts layout
 */
export default function ConflictsLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return children;
}
