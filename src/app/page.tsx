import Link from "next/link";
import { Inter, Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

export default function Home() {
  return (
    <div className={`min-h-screen bg-[#0A020D] text-white overflow-hidden relative flex flex-col ${inter.className}`}>
      
      {/* Fondo Abstracto (Simulación de ondas con gradientes) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-banco-primary opacity-20 filter blur-[150px] rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute top-[20%] right-[30%] w-[500px] h-[500px] bg-banco-secondary opacity-10 filter blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Patrón de líneas sutil de fondo */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #A78BFA 0, #A78BFA 1px, transparent 1px, transparent 20px)' }}></div>

      {/* Navbar Simple */}
      <nav className="w-full relative z-50 py-6 px-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
            <span className={`font-black text-2xl tracking-tighter text-white ${outfit.className}`}>
              banco<span className="text-banco-secondary">UM</span>
            </span>
        </div>
      </nav>

      {/* Main Content (2 Columns) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-10 flex flex-col lg:flex-row items-center justify-between z-10 relative">
        
        {/* Columna Izquierda: Textos y Botones */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-8 mt-10 lg:mt-0">
          <h1 className={`text-6xl md:text-[5.5rem] font-black leading-[0.9] tracking-tight uppercase ${outfit.className}`}>
            <span className="text-banco-primary block text-shadow-glow">Ahorra y</span>
            <span className="text-banco-primary block text-shadow-glow">multiplica</span>
            <span className="text-white block mt-2">tu capital</span>
            <span className="text-white block">con nosotros</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-normal max-w-lg leading-snug">
            Acceso permanente a tus cuentas, saldos, gestión de deudas y pagos programados en segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 mt-4 w-full sm:w-auto">
            <Link 
              href="/registro"
              className="w-full sm:w-auto px-10 py-5 bg-banco-primary hover:bg-[#682ad8] text-white font-bold text-sm tracking-wider uppercase rounded-2xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] text-center">
              Elegir Tarjeta
            </Link>
            <Link 
              href="/app"
              className="w-full sm:w-auto px-10 py-5 border-2 border-banco-primary hover:bg-banco-primary/10 text-banco-primary font-bold text-sm tracking-wider uppercase rounded-2xl transition-all text-center">
              Descargar App
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Tarjetas Flotantes */}
        <div className="w-full lg:w-1/2 relative h-[500px] mt-20 lg:mt-0 perspective-1000">
            
            {/* Tarjeta Fondo (Sólida Primaria) */}
            <div className="absolute right-0 bottom-0 w-[420px] h-[250px] bg-banco-primary rounded-3xl p-8 flex flex-col justify-between shadow-2xl transform rotate-[-10deg] translate-x-10 translate-y-10 z-0">
               <div className="flex justify-between items-start">
                  <div className="flex gap-1.5 flex-wrap w-8">
                     <span className="w-3 h-3 bg-white/80 rounded-sm"></span><span className="w-3 h-3 bg-white/80 rounded-sm"></span>
                     <span className="w-3 h-3 bg-white/80 rounded-sm"></span><span className="w-3 h-3 border border-white/80 rounded-sm"></span>
                  </div>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               
               <div className="mt-8">
                  <p className="text-white/60 text-xs font-semibold mb-1">Número de tarjeta</p>
                  <p className={`text-2xl text-white tracking-widest ${outfit.className}`}>3236 6734 5476 3224</p>
               </div>
               <div className="flex justify-between items-end mt-4">
                  <p className={`text-sm text-white tracking-widest uppercase ${outfit.className}`}>BRUCE WAYNE</p>
                  <div className="text-right">
                    <p className="text-white/60 text-[10px] font-semibold mb-0.5">Vence</p>
                    <p className={`text-sm text-white tracking-widest ${outfit.className}`}>11/25</p>
                  </div>
               </div>
            </div>

            {/* Tarjeta Frente (Glassmorphism Frosted) */}
            <div className="absolute top-10 right-10 w-[480px] h-[280px] bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.5)] transform rotate-[-8deg] -translate-x-10 -translate-y-5 z-10 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none">
               <div className="relative z-10 flex justify-between items-start">
                  <div className="flex gap-1.5 flex-wrap w-8">
                     <span className="w-3 h-3 bg-white/90 rounded-sm"></span><span className="w-3 h-3 bg-white/90 rounded-sm"></span>
                     <span className="w-3 h-3 border border-white/90 rounded-sm"></span><span className="w-3 h-3 bg-white/90 rounded-sm"></span>
                  </div>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               
               <div className="relative z-10 mt-12">
                  <p className="text-gray-300 text-xs font-medium mb-1">Número de tarjeta</p>
                  <p className={`text-2xl text-white tracking-widest ${outfit.className} text-shadow-sm`}>3346 6732 5464 9124</p>
               </div>
               <div className="relative z-10 flex justify-between items-end mt-4">
                  <p className={`text-sm text-gray-200 tracking-widest uppercase ${outfit.className}`}>ALEJANDRO RENDON</p>
                  <div className="text-right">
                    <p className="text-gray-300 text-[10px] font-medium mb-0.5">Vence</p>
                    <p className={`text-sm text-white tracking-widest ${outfit.className}`}>11/27</p>
                  </div>
               </div>
            </div>

        </div>
      </main>
    </div>
  );
}
