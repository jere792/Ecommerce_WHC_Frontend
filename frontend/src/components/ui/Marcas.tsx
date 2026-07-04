import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const Marcas: React.FC = () => {
  const [marcas, setMarcas] = useState<{ nombre: string; logoSrc: string }[]>(
    [],
  );

  useEffect(() => {
    supabase
      .from("marca_p")
      .select("nombre_marca_producto, logo_url")
      .eq("mostrar_en_home", true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMarcas(
            data.map((m: any) => ({
              nombre: m.nombre_marca_producto,
              logoSrc: m.logo_url || "/placeholder-marca.png",
            })),
          );
        }
      });
  }, []);

  if (marcas.length === 0) return null;

  return (
    <div className="w-full overflow-hidden py-8 bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <div className="h-0.5 bg-gray-300 w-16 sm:w-32" />
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 whitespace-nowrap text-center">
          Trabajamos con las mejores marcas
        </h2>
        <div className="h-0.5 bg-gray-300 w-16 sm:w-32" />
      </div>

      <div className="overflow-hidden mt-8">
        <div className="marquee-track flex">
          {[...marcas, ...marcas, ...marcas].map((marca, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[100px] sm:w-[150px] h-[70px] sm:h-[100px] flex items-center justify-center mx-1.5 sm:mx-2.5"
            >
              <img
                src={marca.logoSrc}
                alt={marca.nombre}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: marquee-right 20s linear infinite;
        }
        @keyframes marquee-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
};

export default Marcas;
