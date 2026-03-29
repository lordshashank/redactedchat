"use client";

import { Icon } from "./Icon";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export function PageHeader({ title, subtitle, showBack, onBack, rightContent }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBack && (
          <button onClick={onBack} className="text-primary cursor-pointer">
            <Icon name="arrow_back" />
          </button>
        )}
        <div>
          <h1 className="font-bold text-lg text-primary matrix-glow">{title}</h1>
          {subtitle && (
            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-mono">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightContent}
    </header>
  );
}
