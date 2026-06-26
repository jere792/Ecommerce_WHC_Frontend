import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ size = 32, text, fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        className="text-primary animate-spin"
        style={{ width: size, height: size }}
      />
      {text && (
        <p className="text-muted-foreground text-sm font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-black/20">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{content}</div>;
}
