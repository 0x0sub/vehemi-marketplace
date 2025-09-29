interface ArrowProps {
  dir: "up" | "down" | "flat";
  className?: string;
}

export function Arrow({ dir, className }: ArrowProps) {
  if (dir === "flat") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
        <path d="M4 12h16" strokeWidth="1.5"/>
      </svg>
    );
  }
  
  if (dir === "up") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
        <path d="M6 10l6-6 6 6" strokeWidth="1.5"/>
        <path d="M12 4v16" strokeWidth="1.5"/>
      </svg>
    );
  }
  
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
      <path d="M6 14l6 6 6-6" strokeWidth="1.5"/>
      <path d="M12 20V4" strokeWidth="1.5"/>
    </svg>
  );
}
