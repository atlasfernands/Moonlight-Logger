import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{ title?: string; className?: string; actions?: React.ReactNode }>;

export function Card({ title, actions, className, children }: CardProps) {
  return (
    <div className={`glass-card ${className ?? ''}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-moon-border/70">
          {title && <h3 className="text-sm tracking-widest uppercase text-neutral-400">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );}

