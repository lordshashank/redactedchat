"use client";

interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
  title?: string;
}

export function Icon({ name, filled, className = "", title }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      title={title}
    >
      {name}
    </span>
  );
}
