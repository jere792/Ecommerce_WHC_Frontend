import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  buttonLabel?: string;
  buttonTo?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
}

export default function PageHeader({ title, buttonLabel, buttonTo, buttonIcon, onButtonClick }: PageHeaderProps) {
  const btn = (
    <span className="flex items-center gap-2 bg-[var(--primary-800)] text-white px-4 py-2 rounded hover:bg-[var(--primary-600)] transition-colors text-sm font-medium">
      {buttonIcon ?? <Plus className="w-4 h-4" />}
      {buttonLabel}
    </span>
  );

  return (
    <div className="flex justify-between items-center pb-4 mb-6 border-b border-border">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {buttonLabel && buttonTo && <Link to={buttonTo}>{btn}</Link>}
      {buttonLabel && onButtonClick && !buttonTo && (
        <button onClick={onButtonClick}>{btn}</button>
      )}
    </div>
  );
}
