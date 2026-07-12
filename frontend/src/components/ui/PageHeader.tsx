import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  buttonLabel?: string;
  buttonTo?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
}

export default function PageHeader({ title, description, icon, buttonLabel, buttonTo, buttonIcon, onButtonClick }: PageHeaderProps) {
  const btn = (
    <span className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium shadow-sm">
      {buttonIcon ?? <Plus className="w-4 h-4" />}
      {buttonLabel}
    </span>
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-5 mb-6 border-b border-border">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {buttonLabel && buttonTo && <Link to={buttonTo}>{btn}</Link>}
      {buttonLabel && onButtonClick && !buttonTo && (
        <button onClick={onButtonClick}>{btn}</button>
      )}
    </div>
  );
}
