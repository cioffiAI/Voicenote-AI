import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: 'mic_none',
    iconClass: 'text-accent',
    title: 'Trascrizione Live',
    desc: 'Registra e trascrivi in tempo reale con supporto multilingua e riconoscimento automatico dei parlanti.'
  },
  {
    icon: 'summarize',
    iconClass: 'text-sky-400',
    title: 'Riassunti Intelligenti',
    desc: 'Ottieni riassunti concisi e accurati dei tuoi testi trascritti in varie lingue.'
  },
  {
    icon: 'g_translate',
    iconClass: 'text-purple-400',
    title: 'Traduzione Istantanea',
    desc: 'Traduci le tue trascrizioni in diverse lingue con la potenza dell\'IA.'
  }
];

// Funzione per effetto tilt 3D
function use3DTilt() {
  const ref = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function handleMouseMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * -10;
      el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.07)`;
      el.style.boxShadow = '0 20px 40px -10px rgba(59,130,246,0.25), 0 4px 8px -2px rgba(59,130,246,0.10)';
    }
    function handleMouseLeave() {
      el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
      el.style.boxShadow = '';
    }
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  return ref;
}

// FeatureCard aggiornata con tilt 3D
const FeatureCard: React.FC<{icon: string, iconClass: string, title: string, desc: string}> = ({icon, iconClass, title, desc}) => {
  const tiltRef = use3DTilt();
  return (
    <div
      ref={tiltRef}
      className="flex flex-col items-center justify-center border border-slate-500/30 rounded-2xl bg-slate-900/40 p-8 min-w-[320px] max-w-md w-full flex-1 mx-auto text-center cursor-pointer transition-transform duration-300"
      style={{willChange: 'transform'}}
    >
      <span className={`material-icons text-5xl mb-4 ${iconClass}`}>{icon}</span>
      <h4 className="text-2xl font-bold mb-2 text-center text-main">{title}</h4>
      <p className="text-secondary text-center text-base font-normal leading-relaxed">{desc}</p>
    </div>
  );
};

const LandingPage: React.FC = () => (
  <div className="min-h-screen flex flex-col main-container text-main">
    <header className="py-6 px-4 sm:px-6 lg:px-8 shadow-lg bg-slate-900/50 backdrop-blur-md w-full">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold tracking-tight">
          VoiceNote <span className="text-accent">AI</span>
        </h1>
        <nav>
          <a className="text-secondary hover:text-main px-3 py-2 rounded-md text-sm font-medium" href="#features">Funzionalità</a>
          <Link className="text-secondary hover:text-main px-3 py-2 rounded-md text-sm font-medium" to="/app">Inizia Ora</Link>
          <a className="text-secondary hover:text-main px-3 py-2 rounded-md text-sm font-medium" href="#faq">FAQ</a>
        </nav>
      </div>
    </header>
    <main className="flex-grow w-full">
      <section className="py-20 sm:py-28 lg:py-32 text-center w-full">
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight w-full">
          Trasforma la tua voce in <span className="text-accent">potenza.</span>
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-secondary">
          VoiceNote AI è il tuo assistente vocale intelligente per trascrivere, riassumere, tradurre e comprendere i tuoi audio con una precisione incredibile.
        </p>
        <div className="mt-10">
          <Link className="btn-primary py-3 px-8 text-lg" to="/app">
            Inizia Subito Gratuitamente
          </Link>
        </div>
      </section>
      <section className="py-16 sm:py-20 bg-slate-900/30 w-full" id="features">
        <h3 className="text-4xl font-bold text-center mb-12 tracking-tight w-full">
          Funzionalità <span className="text-accent">Rivoluzionarie</span>
        </h3>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-row flex-wrap gap-8 justify-center items-center">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 sm:py-28 text-center w-full" id="cta">
        <h3 className="text-4xl font-bold mb-6 tracking-tight w-full">Pronto a Semplificare il Tuo Lavoro?</h3>
        <p className="text-lg text-secondary mb-10">
          Sperimenta la magia di VoiceNote AI. Niente più appunti manuali, solo produttività e chiarezza.
        </p>
        <Link className="btn-primary py-4 px-10 text-xl" to="/app">
          Prova VoiceNote AI Ora
        </Link>
        <p className="text-sm text-slate-500 mt-4">Inizia gratuitamente. Nessuna carta di credito richiesta.</p>
      </section>
      <section className="py-16 sm:py-20 bg-slate-900/30 w-full" id="faq">
        <h3 className="text-4xl font-bold text-center mb-12 tracking-tight w-full">
          Domande <span className="text-accent">Frequenti</span>
        </h3>
        <div className="space-y-6">
          <details className="bg-slate-800/50 p-6 rounded-lg group">
            <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center text-main group-hover:text-accent">
              Come funziona la trascrizione live?
              <span className="material-icons transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <p className="text-secondary mt-3">
              Semplicemente clicca su "Avvia Registrazione", seleziona la lingua e il numero di parlanti. VoiceNote AI inizierà a trascrivere ciò che viene detto in tempo reale.
            </p>
          </details>
          <details className="bg-slate-800/50 p-6 rounded-lg group">
            <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center text-main group-hover:text-accent">
              VoiceNote AI è gratuito?
              <span className="material-icons transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <p className="text-secondary mt-3">
              Offriamo un piano gratuito con funzionalità di base. Per funzionalità avanzate e un utilizzo illimitato, saranno disponibili piani premium.
            </p>
          </details>
          <details className="bg-slate-800/50 p-6 rounded-lg group">
            <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center text-main group-hover:text-accent">
              Quanto è accurata l'IA?
              <span className="material-icons transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <p className="text-secondary mt-3">
              Utilizziamo modelli di intelligenza artificiale all'avanguardia per garantire la massima accuratezza possibile. Tuttavia, come per ogni IA, possono verificarsi errori occasionali, specialmente con audio di bassa qualità o rumori di fondo.
            </p>
          </details>
        </div>
      </section>
    </main>
    <footer className="text-center py-10 bg-slate-900 w-full">
      <p className="text-sm text-secondary">© 2025 VoiceNote AI. Realizzato con Intelligenza Artificiale e Web Speech API.</p>
      <p className="text-xs text-slate-500 mt-1">Innovazione al servizio della tua voce.</p>
    </footer>
  </div>
);

export default LandingPage; 