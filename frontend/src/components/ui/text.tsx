import React from "react";

interface TextProps {
  title: string;
  subtitle: string;
  color?: string; // color del subrayado (opcional)
  className?: string; // clases adicionales para el contenedor
}

const Text: React.FC<TextProps> = ({
  title,
  subtitle,
  color = "#0D3C6B",
  className = "",
}) => {
  return (
    <div className={`text-center py-8 bg-primary-50 ${className}`}>
      <h2 className="text-xl md:text-2xl font-semibold text-primary-800 tracking-wide uppercase">
        {title}
      </h2>
      <div
        className="w-16 h-1 mx-auto my-2"
        style={{ backgroundColor: color }}
      />
      <p className="text-sm md:text-base text-primary-800">{subtitle}</p>
    </div>
  );
};

export default Text;
