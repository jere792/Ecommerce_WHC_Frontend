import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import type { IngresoMercaderia } from "../../lib/supabaseTypes";
import { ArrowDownUp, Eye, Package } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import DataTable, { type Column } from "../../components/ui/DataTable";

export default function AdminIngresoMercaderia() {
  const navigate = useNavigate();
  const [ingresos, setIngresos] = useState<IngresoMercaderia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    loadIngresos();
  }, []);

  const loadIngresos = async () => {
    const { data } = await supabase
      .from("ingreso_mercaderia")
      .select("*, detalles:ingreso_detalle(*, producto:pk_producto(*))")
      .order("fecha", { ascending: false });
    if (data) setIngresos(data as unknown as IngresoMercaderia[]);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let result = ingresos;

    if (search.length >= 3) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          (i.codigo_transaccion || "").toLowerCase().includes(q) ||
          (i.observacion || "").toLowerCase().includes(q),
      );
    }

    if (fechaInicio) {
      const d = new Date(fechaInicio);
      result = result.filter((i) => new Date(i.fecha) >= d);
    }
    if (fechaFin) {
      const d = new Date(fechaFin + "T23:59:59");
      result = result.filter((i) => new Date(i.fecha) <= d);
    }

    return result;
  }, [ingresos, search, fechaInicio, fechaFin]);

  const columns: Column<IngresoMercaderia>[] = [
    {
      header: "Código",
      render: (i) => (
        <span className="font-medium text-foreground font-mono">
          {i.codigo_transaccion || `#${i.id_ingreso}`}
        </span>
      ),
    },
    {
      header: "Fecha",
      width: "250px",
      render: (i) => (
        <span className="text-muted-foreground text-sm">
          {new Date(i.fecha).toLocaleString("es-PE")}
        </span>
      ),
    },
    {
      header: "Productos",
      width: "250px",
      align: "center",
      render: (i) => (
        <span className="text-foreground font-medium">
          {i.detalles?.length || 0}
        </span>
      ),
    },
    {
      header: "Observación",
      width: "320px",
      render: (i) => (
        <span className="text-foreground">{i.observacion || "—"}</span>
      ),
    },
    {
      header: "Acciones",
      width: "100px",
      align: "center",
      render: (i) => (
        <button
          onClick={() => navigate(`/admin/ingresos/${i.id_ingreso}`)}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          title="Ver detalle"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">
        Cargando...
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Ingresos de mercadería"
        description="Registro de entradas de productos al inventario"
        icon={<Package className="w-5 h-5" />}
        buttonLabel="Nuevo ingreso"
        buttonTo="/admin/ingresos/nuevo"
      />

      <FilterBar
        title="ingresos"
        onClear={() => {
          setSearch("");
          setFechaInicio("");
          setFechaFin("");
        }}
        fields={[
          {
            type: "search",
            label: "Buscar",
            value: search,
            onChange: setSearch,
            placeholder: "Buscar por código u observación...",
          },
          {
            type: "date",
            label: "Desde",
            value: fechaInicio,
            onChange: setFechaInicio,
          },
          {
            type: "date",
            label: "Hasta",
            value: fechaFin,
            onChange: setFechaFin,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(i) => i.id_ingreso}
        emptyMessage="No se encontraron ingresos"
      />
    </div>
  );
}
