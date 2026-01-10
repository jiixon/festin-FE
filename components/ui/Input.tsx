import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-400 mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-3 bg-black border rounded-lg transition-colors text-white',
          'focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
          'placeholder:text-neutral-600',
          error ? 'border-red-500' : 'border-neutral-800',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
