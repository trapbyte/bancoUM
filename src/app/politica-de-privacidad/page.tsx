import { Outfit, Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Info } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Política de Privacidad | bancoUM",
  description: "Política de Privacidad y Tratamiento de Datos Personales",
};

export default function PoliticaPrivacidad() {
  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${inter.className}`}>
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 text-violet-600 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-black text-gray-900 mb-4 ${outfit.className}`}>
              Política de Privacidad
            </h1>
            <p className="text-lg text-gray-500">
              Última actualización: Abril de 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-gray-600 space-y-6">
            <p className="lead text-lg">
              En <strong>bancoUM</strong> valoramos su confianza y estamos comprometidos con la protección de su información personal. Esta política ha sido elaborada en cumplimiento de la Ley 1581 de 2012 (Ley de Protección de Datos Personales) de Colombia y sus decretos reglamentarios.
            </p>

            <h2 className={`text-2xl font-bold text-gray-900 mt-10 mb-4 ${outfit.className}`}>1. Información que recopilamos</h2>
            <p>
              Recopilamos información que usted nos proporciona directamente al abrir una cuenta o utilizar nuestros servicios financieros, incluyendo:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Nombres y apellidos completos.</li>
              <li>Número y tipo de documento de identidad (Cédula de ciudadanía, NIT, etc.).</li>
              <li>Datos de contacto (correo electrónico, número de teléfono, dirección).</li>
              <li>Información financiera y perfiles de ingresos requeridos por la Superintendencia Financiera.</li>
              <li>Datos biométricos y de verificación para autenticación segura en el sistema (incluyendo PIN y contraseñas derivadas).</li>
            </ul>

            <h2 className={`text-2xl font-bold text-gray-900 mt-10 mb-4 ${outfit.className}`}>2. Finalidad del Tratamiento de Datos</h2>
            <p>
              Su información será utilizada estrictamente para los siguientes propósitos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Verificación de identidad y prevención de fraude y lavado de activos (SARLAFT).</li>
              <li>Prestación de los servicios bancarios solicitados, gestión de saldos y emisión de estados de cuenta.</li>
              <li>Realización de transacciones, depósitos y retiros.</li>
              <li>Comunicación de alertas de seguridad y confirmación de operaciones.</li>
              <li>Cumplimiento de obligaciones legales financieras y regulatorias frente a las entidades gubernamentales competentes.</li>
            </ul>

            <h2 className={`text-2xl font-bold text-gray-900 mt-10 mb-4 ${outfit.className}`}>3. Seguridad de sus Datos</h2>
            <p>
              Implementamos medidas rigurosas técnicas, humanas y administrativas para proteger sus datos personales frente a pérdida, alteración, acceso indebido o fraude. Su información está amparada bajo el secreto bancario y viaja a través de canales encriptados avalados por la industria.
            </p>

            <h2 className={`text-2xl font-bold text-gray-900 mt-10 mb-4 ${outfit.className}`}>4. Derechos del Titular de la Información</h2>
            <p>
              De acuerdo con la legislación colombiana (Ley 1581 de 2012), usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Conocer, actualizar y rectificar permanentemente sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada para el manejo de su información.</li>
              <li>Ser informado respecto al uso que se le ha dado a sus datos.</li>
              <li>Revocar la autorización y/o solicitar la supresión de datos (siempre que no exista una obligación legal o contractual que requiera su conservación, como manda la contabilidad bancaria).</li>
            </ul>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-10 flex gap-4 text-blue-800">
              <Info className="w-8 h-8 flex-shrink-0" />
              <p className="text-sm">
                <strong>Contacto de Privacidad:</strong> Si tiene solicitudes, quejas o reclamos en materia de privacidad o protección de datos personales, por favor diríjase al Área de Cumplimiento enviando un correo a <strong>privacidad@bancoum.com.co</strong> o comuníquese a nuestra línea nacional 01-8000-BANCOUM.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}