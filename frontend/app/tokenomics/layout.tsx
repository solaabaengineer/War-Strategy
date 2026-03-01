import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tokenomics - War Strategy",
  description: "Complete breakdown of $WSTR token distribution and fee mechanics",
};

/**
 * Tokenomics layout
 */
export default function TokenomicsLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return children;
}
