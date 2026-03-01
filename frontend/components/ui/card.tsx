/**
 * Card component for UI
 */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div className={`bg-military-light border border-military-olive rounded-lg ${className}`}>
      {children}
    </div>
  );
}
