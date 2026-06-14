import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

const Marcas: React.FC = () => {
    const [marcas, setMarcas] = useState<{ nombre: string; logoSrc: string }[]>([]);

    useEffect(() => {
        supabase
            .from('marca_p')
            .select('nombre_marca_producto, logo_url')
            .eq('mostrar_en_home', true)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setMarcas(
                        data.map((m: any) => ({
                            nombre: m.nombre_marca_producto,
                            logoSrc: m.logo_url || '/placeholder-marca.png',
                        }))
                    );
                }
            });
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [, setIntervalId] = useState<number | null>(null);

    const marcaWidth = 150;
    const espacioEntreMarcas = 20;
    const totalMarcaWidth = marcaWidth + espacioEntreMarcas;

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            const newIntervalId = window.setInterval(() => {
                setScrollPosition(prevPosition => {
                    const maxScroll = container.scrollWidth - container.clientWidth;
                    const newPosition = prevPosition + totalMarcaWidth;

                    if (newPosition > maxScroll) {
                        return 0;
                    }
                    return newPosition;
                });
            }, 2000);

            setIntervalId(newIntervalId);

            return () => {
                clearInterval(newIntervalId);
                setIntervalId(null);
            };
        }
    }, [totalMarcaWidth, marcas.length]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = scrollPosition;
        }
    }, [scrollPosition]);

    if (marcas.length === 0) return null;

    return (
        <div className="w-full overflow-hidden py-8 bg-white">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800 whitespace-nowrap text-center sm:text-left">
                    Trabajamos con las mejores marcas
                </h2>
                <div className="h-0.5 bg-gray-300 w-full sm:w-32" />
            </div>
            <div ref={containerRef} className="flex overflow-x-hidden whitespace-nowrap scroll-smooth">
                {marcas.map((marca, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-[150px] h-[100px] flex items-center justify-center"
                        style={{ marginRight: `${espacioEntreMarcas}px` }}
                    >
                        <img
                            src={marca.logoSrc}
                            alt={marca.nombre}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                ))}
                {marcas.map((marca, index) => (
                    <div
                        key={`clone-${index}`}
                        className="flex-shrink-0 w-[150px] h-[100px] flex items-center justify-center"
                        style={{ marginRight: `${espacioEntreMarcas}px` }}
                    >
                        <img
                            src={marca.logoSrc}
                            alt={marca.nombre}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marcas;
