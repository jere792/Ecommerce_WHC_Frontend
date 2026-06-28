import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BookOpen } from 'lucide-react';

interface FormData {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  pkTipoFormulario: number | null;
  domicilio: string;
  detalle: string;
  acepta: boolean;
}

interface FormErrors {
  nombres?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  pkTipoFormulario?: string;
  domicilio?: string;
  detalle?: string;
  acepta?: string;
}

export function LibroReclamacionesForm() {
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    dni: "",
    telefono: "",
    email: "",
    pkTipoFormulario: null,
    domicilio: "",
    detalle: "",
    acepta: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const opcionesTipo = [
    { label: "Reclamo Producto", value: 1 },
    { label: "Reclamo Servicio", value: 2 },
    { label: "Reclamo Instalacion", value: 3 },
  ];

  // Función de validación
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validar Nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = "Los nombres son obligatorios.";
      isValid = false;
    } else if (formData.nombres.trim().length < 3) {
      newErrors.nombres = "Los nombres deben tener al menos 3 caracteres.";
      isValid = false;
    }

    // Validar Apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios.";
      isValid = false;
    } else if (formData.apellidos.trim().length < 3) {
      newErrors.apellidos = "Los apellidos deben tener al menos 3 caracteres.";
      isValid = false;
    }

    // Validar DNI (Perú: 8 dígitos numéricos)
    const dniRegex = /^\d{8}$/;
    if (!formData.dni) {
      newErrors.dni = "El DNI es obligatorio.";
      isValid = false;
    } else if (!dniRegex.test(formData.dni)) {
      newErrors.dni = "El DNI debe contener exactamente 8 números.";
      isValid = false;
    }

    // Validar Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio.";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido.";
      isValid = false;
    }

    // Validar Teléfono (Mínimo 7 dígitos, máximo 15, solo números)
    const phoneRegex = /^\d{7,15}$/;
    if (formData.telefono && !phoneRegex.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe contener entre 7 y 15 números.";
      isValid = false;
    }

    // Validar Domicilio
    if (!formData.domicilio.trim()) {
      newErrors.domicilio = "El domicilio es obligatorio.";
      isValid = false;
    } else if (formData.domicilio.trim().length < 5) {
      newErrors.domicilio = "Ingresa un domicilio válido.";
      isValid = false;
    }

    // Validar Tipo de Reclamo
    if (!formData.pkTipoFormulario) {
      newErrors.pkTipoFormulario = "Debes seleccionar el tipo de reclamo.";
      isValid = false;
    }

    // Validar Detalle
    if (!formData.detalle.trim()) {
      newErrors.detalle = "El detalle del reclamo es obligatorio.";
      isValid = false;
    } else if (formData.detalle.trim().length < 10) {
      newErrors.detalle = "Por favor, detalla un poco más tu reclamo (mínimo 10 caracteres).";
      isValid = false;
    }

    // Validar Aceptación
    if (!formData.acepta) {
      newErrors.acepta = "Debes aceptar los términos para continuar.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value, type } = target;

    const newValue =
      type === "checkbox" && target instanceof HTMLInputElement
        ? target.checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Limpiar error del campo mientras se escribe
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTipoChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      pkTipoFormulario: value,
    }));
    if (errors.pkTipoFormulario) {
      setErrors((prev) => ({ ...prev, pkTipoFormulario: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Ejecutar validaciones antes de enviar
    if (!validateForm()) {
      return; // Detiene el envío si hay errores
    }

    setLoading(true);
    try {
      const dataToSend = {
        nombreFormulario: `${formData.nombres} ${formData.apellidos}`,
        dniFormulario: formData.dni,
        correoFormulario: formData.email,
        telefonoFormulario: formData.telefono,
        pkTipoFormulario: formData.pkTipoFormulario,
        pkEstadoFormulario: 1,
        textEstado: `Domicilio: ${formData.domicilio}\n\nDetalle: ${formData.detalle}`,
      };
    
      const { error: insertError } = await supabase
        .from('formulario')
        .insert({
          nombre_formulario: dataToSend.nombreFormulario,
          dni_formulario: dataToSend.dniFormulario,
          correo_formulario: dataToSend.correoFormulario,
          telefono_formulario: dataToSend.telefonoFormulario,
          pk_tipo_formulario: dataToSend.pkTipoFormulario,
          pk_estado_formulario: dataToSend.pkEstadoFormulario,
          text_estado: dataToSend.textEstado,
        });

      if (insertError) {
        throw new Error(`Error al enviar el reclamo: ${insertError.message}`);
      }

      // Limpiar formulario tras éxito
      alert("Reclamo enviado correctamente");
      setFormData({
        nombres: "",
        apellidos: "",
        dni: "",
        telefono: "",
        email: "",
        pkTipoFormulario: null,
        domicilio: "",
        detalle: "",
        acepta: false,
      });
      setErrors({}); // Limpiar errores

    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
        console.error("Error al enviar el reclamo:", error);
      } else {
        setServerError("Ocurrió un error inesperado. Inténtalo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-6 py-8">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-100 p-4 rounded-full mb-4 shadow-sm">
            <BookOpen className="w-8 h-8 text-blue-700" />
          </div>
          <h2 className="text-3xl font-bold text-blue-900 tracking-tight">
            Libro de Reclamaciones
          </h2>
          <p className="text-gray-500 text-sm mt-2">Déjanos tu reclamo y te atenderemos a la brevedad</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-blue-100">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Fila 1: Nombres y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
                  errors.nombres
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
                  errors.apellidos
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
            </div>
          </div>

          {/* Fila 2: DNI y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                DNI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dni"
                maxLength={8}
                value={formData.dni}
                onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) handleChange(e);
                }}
                className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
                  errors.dni
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                maxLength={15}
                value={formData.telefono}
                onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) handleChange(e);
                }}
                className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
                  errors.telefono
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>
          </div>

          {/* Fila 3: Correo */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
                errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Fila 4: Tipo de reclamo */}
          <div>
            <label className="block mb-4 font-medium text-gray-700">
              Tipo de Reclamo <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {opcionesTipo.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  className={`w-full px-6 py-4 rounded-lg font-semibold border text-center transition ${
                    formData.pkTipoFormulario === value
                      ? "bg-blue-700 text-white border-blue-700 ring-2 ring-offset-2 ring-blue-500"
                      : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
                  } ${errors.pkTipoFormulario ? "border-red-500" : ""}`}
                  onClick={() => handleTipoChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.pkTipoFormulario && (
              <p className="text-red-500 text-sm mt-2 text-center sm:text-left">{errors.pkTipoFormulario}</p>
            )}
          </div>

          {/* Fila 5: Domicilio */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Domicilio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="domicilio"
              value={formData.domicilio}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
                errors.domicilio
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.domicilio && <p className="text-red-500 text-xs mt-1">{errors.domicilio}</p>}
          </div>

          {/* Fila 6: Descripción de la queja */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Descripción de la queja <span className="text-red-500">*</span>
            </label>
            <textarea
              name="detalle"
              value={formData.detalle}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none resize-none ${
                errors.detalle
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.detalle && <p className="text-red-500 text-xs mt-1">{errors.detalle}</p>}
          </div>

          {/* Fila 7: Checkbox */}
          <div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="acepta"
                checked={formData.acepta}
                onChange={handleChange}
                className="mt-1 accent-blue-700 w-5 h-5 cursor-pointer"
                id="acepta-terms"
              />
              <label htmlFor="acepta-terms" className="text-sm text-gray-600 leading-snug cursor-pointer select-none">
                Acepto que esta información será tratada según la política de
                protección de datos personales. <span className="text-red-500">*</span>
              </label>
            </div>
            {errors.acepta && <p className="text-red-500 text-xs mt-1 ml-8">{errors.acepta}</p>}
          </div>

          {/* Botón y Errores de Servidor */}
          <div className="text-center">
            <button
              type="submit"
              className={`bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition duration-300 ease-in-out ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar reclamo'
              )}
            </button>
            {serverError && <p className="mt-4 text-red-600 font-medium bg-red-50 p-2 rounded">{serverError}</p>}
          </div>
        </form>
        </div>
      </div>
    </section>
  );
}