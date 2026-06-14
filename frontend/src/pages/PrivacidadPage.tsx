import PageHeroBanner from '../components/ui/PageHero';

export default function PrivacidadPage() {
  return (
    <div className="bg-white">
      <PageHeroBanner pagina="privacidad" />
      <div className="container mx-auto px-4 py-12 max-w-4xl text-gray-600 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">1. Introducción</h2>
          <p>
            En <strong className="text-[#0D3C6B]">WHC Representaciones</strong> nos comprometemos a proteger su privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos sus datos personales, en cumplimiento con la Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento aprobado por Decreto Supremo N° 003-2013-JUS.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">2. Datos que Recopilamos</h2>
          <p>Podemos recopilar los siguientes datos personales cuando usted utiliza nuestro sitio web o realiza una compra:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Nombres y apellidos</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección de envío</li>
            <li>Historial de compras</li>
            <li>Información de navegación (cookies, dirección IP, páginas visitadas)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">3. Finalidad del Tratamiento de Datos</h2>
          <p>Sus datos personales serán utilizados para las siguientes finalidades:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Procesar y gestionar sus pedidos y compras.</li>
            <li>Enviar información sobre el estado de su pedido.</li>
            <li>Brindar atención al cliente y resolver consultas o reclamos.</li>
            <li>Enviar comunicaciones comerciales y promociones, previo consentimiento.</li>
            <li>Mejorar nuestros productos y servicios.</li>
            <li>Cumplir con obligaciones legales y regulatorias.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">4. Base Legal</h2>
          <p>
            El tratamiento de sus datos personales se realiza en base a las siguientes bases legales: la ejecución de la relación contractual (compra de productos), su consentimiento expreso, y el cumplimiento de obligaciones legales aplicables.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">5. Conservación de Datos</h2>
          <p>
            Conservaremos sus datos personales durante el tiempo necesario para cumplir con las finalidades descritas en esta política, o mientras exista una obligación legal de conservarlos. Una vez cumplidas dichas finalidades, procederemos a su eliminación o anonimización de forma segura.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">6. Derechos del Titular de Datos</h2>
          <p>
            De conformidad con la Ley N° 29733, usted tiene los siguientes derechos sobre sus datos personales:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Información:</strong> Conocer si sus datos están siendo tratados y con qué finalidad.</li>
            <li><strong>Acceso:</strong> Acceder a sus datos personales en nuestro poder.</li>
            <li><strong>Actualización:</strong> Solicitar la corrección o actualización de sus datos.</li>
            <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios.</li>
            <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para fines específicos.</li>
          </ul>
          <p>
            Para ejercer estos derechos, puede contactarnos a través de whsRepresentaciones@gmail.com. Atenderemos su solicitud en un plazo máximo de 15 días hábiles.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">7. Medidas de Seguridad</h2>
          <p>
            Implementamos medidas de seguridad técnicas, organizativas y legales adecuadas para proteger sus datos personales contra acceso no autorizado, pérdida, destrucción o alteración. Estas medidas incluyen el uso de conexiones seguras (HTTPS), almacenamiento cifrado y controles de acceso restringido.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">8. Transferencia de Datos</h2>
          <p>
            Sus datos personales no serán compartidos con terceros sin su consentimiento, salvo en los siguientes casos: proveedores de servicios de pago, empresas de envío y logística, y cuando sea requerido por ley o autoridad competente.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">9. Cookies</h2>
          <p>
            Nuestro sitio web utiliza cookies y tecnologías similares para mejorar su experiencia de navegación. Puede configurar su navegador para rechazar las cookies, aunque esto podría afectar el funcionamiento de algunas funciones del sitio.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">10. Cambios a la Política de Privacidad</h2>
          <p>
            Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Los cambios serán publicados en esta página con la fecha de actualización correspondiente. Le recomendamos revisar periódicamente esta política.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-[#0D3C6B] mb-3">11. Contacto</h2>
          <p>
            Si tiene preguntas o inquietudes sobre esta Política de Privacidad o sobre el tratamiento de sus datos personales, puede contactarnos:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Correo electrónico:</strong> whsRepresentaciones@gmail.com</li>
            <li><strong>WhatsApp:</strong> (+51) 949790715</li>
            <li><strong>Dirección:</strong> Los Rubies 295, La Victoria, Lima, Perú</li>
          </ul>
        </section>
        <p className="text-sm text-gray-500 mt-8">Última actualización: Junio 2026</p>
      </div>
    </div>
  );
}
