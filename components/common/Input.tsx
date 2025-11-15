
import React from 'react';

interface InputProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'number';
  unit?: string;
  as?: 'textarea';
}

export const Input: React.FC<InputProps> = ({ label, id, value, onChange, type = 'text', unit, as }) => {
  const commonProps = {
    id,
    value,
    onChange,
    className: "mt-1 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  };

  const InputComponent = as === 'textarea'
    ? <textarea {...commonProps} rows={3} />
    : <input type={type} {...commonProps} step={type === 'number' ? 'any' : undefined} />;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {InputComponent}
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-slate-500 sm:text-sm" id={`${id}-unit`}>
              {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
