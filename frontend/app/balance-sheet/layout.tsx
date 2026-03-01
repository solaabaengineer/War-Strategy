import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Balance Sheet - War Strategy",
  description: "Real-time transparency of all treasury holdings and valuations",
};

/**
 * Balance sheet layout
 */
export default function BalanceSheetLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return children;
}
