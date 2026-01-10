import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-neutral-900 rounded-xl border border-neutral-800 p-4',
        hover && 'hover:bg-neutral-800 transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
