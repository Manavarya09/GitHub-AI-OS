import { useState, useEffect } from 'react';
import { motion, useAnimate } from 'motion/react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

function ScrambleText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const [oldText, setOldText] = useState(text);

  useEffect(() => {
    if (text === oldText) return;
    
    let iteration = 0;
    const maxLength = Math.max(oldText.length, text.length);
    let animationFrame: number;
    
    const animate = () => {
      setDisplay(() => {
        return Array.from({ length: maxLength })
          .map((_, index) => {
            if (index < iteration) {
              return text[index] || '';
            }
            if (index >= text.length && index < iteration) {
                return '';
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
      });
      
      iteration += 0.4;
      
      if (iteration < maxLength) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
        setOldText(text);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [text, oldText]);

  return <span>{display}</span>;
}

const products = [
  {
    id: 'coffee',
    title: 'COFFEE',
    subtitle: 'SATVIK COFFEE',
    desc: 'Rich, premium Satvik coffee made with ethically sourced beans and traditional roasting methods for a pure, energizing brew.',
    meta: '1 CASE (6 BAGS)',
    bgColor: '#A87B51',
    textColor: '#3B2313',
    fontSize: '32vw',
    shape: "polygon(35% 5%, 50% 5%, 65% 5%, 70% 30%, 80% 60%, 85% 90%, 85% 98%, 70% 100%, 50% 100%, 30% 100%, 15% 98%, 15% 90%, 20% 60%, 30% 30%, 32% 15%, 35% 5%)"
  },
  {
    id: 'noodles',
    title: 'NOODLES',
    subtitle: 'SATVIK NOODLES',
    desc: 'Wholesome, quick-cooking Satvik noodles made with natural ingredients and aromatic spices.',
    meta: '1 CASE (6 PACKS)',
    bgColor: '#A3FF00',
    textColor: '#005928',
    fontSize: '28vw',
    shape: "polygon(10% 15%, 50% 15%, 90% 15%, 90% 20%, 85% 40%, 80% 70%, 75% 95%, 65% 100%, 50% 100%, 35% 100%, 25% 95%, 20% 70%, 15% 40%, 10% 20%, 10% 17%, 10% 15%)"
  },
  {
    id: 'namkeen',
    title: 'NAMKEEN',
    subtitle: 'SATVIK NAMKEEN',
    desc: 'Wholesome, quick-cooking Satvik namkeen made with natural ingredients and aromatic spices.',
    meta: '1 CASE (6 PACKS)',
    bgColor: '#00A3FF',
    textColor: '#001A4D',
    fontSize: '28vw',
    shape: "polygon(10% 10%, 50% 10%, 90% 10%, 90% 30%, 85% 50%, 90% 70%, 90% 90%, 70% 95%, 50% 95%, 30% 95%, 10% 90%, 10% 70%, 15% 50%, 10% 30%, 10% 20%, 10% 10%)"
  },
  {
    id: 'chips',
    title: 'CHIPS',
    subtitle: 'SATVIK CHIPS',
    desc: 'The perfect crunchy, sea salt pita chip for snacking and dipping. Made with natural ingredients.',
    meta: '1 CASE (6 BAGS)',
    bgColor: '#FFE600',
    textColor: '#FF4D00',
    fontSize: '38vw',
    shape: "polygon(15% 5%, 50% 5%, 85% 5%, 85% 20%, 80% 50%, 85% 80%, 85% 95%, 70% 98%, 50% 98%, 30% 98%, 15% 95%, 15% 80%, 20% 50%, 15% 20%, 15% 10%, 15% 5%)"
  }
];

const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

export default function App() {
  const [index, setIndex] = useState(0);
  const product = products[index];
  
  const [textRef, animateText] = useAnimate();
  const [silhouetteRef, animateSilhouette] = useAnimate();

  useEffect(() => {
    animateText(
      textRef.current,
      { 
        filter: ['blur(20px)', 'blur(0px)'], 
        scaleX: [1.1, 1],
        opacity: [0.6, 1]
      },
      { duration: 0.8, ease: [0.77, 0, 0.175, 1] }
    );
    
    animateSilhouette(
      silhouetteRef.current,
      {
        scale: [0.95, 1.05, 1],
        rotate: [0, index % 2 === 0 ? 3 : -3, 0]
      },
      { duration: 0.8, ease: [0.77, 0, 0.175, 1] }
    );
  }, [index, animateText, textRef, animateSilhouette, silhouetteRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-6 md:p-12 font-sans">
      <svg className="hidden">
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>

      {/* Background */}
      <motion.div 
        className="absolute inset-0 -z-20"
        animate={{ backgroundColor: product.bgColor }}
        transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
      />
      
      {/* Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none -z-10" 
        style={{ backgroundImage: `url("${noiseSvg}")` }}
      />

      {/* Massive Text */}
      <div className="absolute inset-0 flex items-center justify-center -z-10 overflow-hidden pointer-events-none">
        <motion.h1 
          ref={textRef}
          className="font-anton uppercase leading-[0.8] tracking-[-0.02em] whitespace-nowrap select-none text-center w-full"
          animate={{ 
            color: product.textColor,
            fontSize: product.fontSize
          }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
        >
          <ScrambleText text={product.title} />
        </motion.h1>
      </div>

      {/* Silhouette */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ filter: 'url(#goo)' }}>
        <motion.div
          ref={silhouetteRef}
          animate={{ clipPath: product.shape }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
          className="w-[45vw] min-w-[200px] max-w-[400px] h-[55vh] min-h-[280px] max-h-[550px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 40%, #000000 100%)',
            boxShadow: 'inset 0 0 40px rgba(255,255,255,0.05)'
          }}
        >
          {/* Subtle 3D highlights */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-50 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20" />
        </motion.div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center z-20 w-full">
        <div className="font-anton text-3xl tracking-widest" style={{ color: product.textColor }}>BLESS BITE</div>
        <div className="flex gap-2 md:gap-3">
          {products.map((p, i) => (
            <button 
              key={p.id} 
              onClick={() => setIndex(i)}
              className="relative w-10 md:w-16 h-2 rounded-full overflow-hidden bg-black/10 transition-colors cursor-pointer"
            >
              {index === i && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-black"
                  transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Content */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end z-20 w-full gap-4 md:gap-8">
        <div className="w-full md:max-w-md flex flex-col">
          <motion.h2 
            key={product.id + '-subtitle'}
            initial={{ y: 20, opacity: 0, filter: 'blur(5px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
            className="text-4xl md:text-6xl font-anton uppercase mb-2 md:mb-4"
            style={{ color: product.textColor }}
          >
            {product.subtitle}
          </motion.h2>
          
          <motion.form
            key={product.id + '-waitlist-desktop'}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
            className="hidden md:flex flex-col sm:flex-row gap-2 w-full max-w-lg"
            onSubmit={(e) => e.preventDefault()}
          >
            <input 
              type="email" 
              placeholder="ENTER EMAIL FOR EARLY ACCESS" 
              className="px-4 py-3 font-sans font-bold text-sm outline-none border-2 w-full sm:w-auto flex-1 transition-colors"
              style={{ 
                borderColor: product.textColor, 
                color: product.textColor,
                backgroundColor: 'transparent'
              }}
            />
            <button 
              type="submit"
              className="px-6 py-3 font-anton tracking-wider text-xl uppercase whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: product.textColor, 
                color: product.bgColor 
              }}
            >
              JOIN WAITLIST
            </button>
          </motion.form>
        </div>

        <div className="flex flex-row items-end justify-between w-full md:w-auto gap-4 md:block">
          <motion.div
            key={product.id + '-coming'}
            initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-anton uppercase leading-[0.85] text-left md:text-right shrink-0"
            style={{ color: product.textColor }}
          >
            COMING<br/>SOON
          </motion.div>

          <motion.form
            key={product.id + '-waitlist-mobile'}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
            className="flex md:hidden flex-col gap-2 w-full max-w-[180px]"
            onSubmit={(e) => e.preventDefault()}
          >
            <input 
              type="email" 
              placeholder="EMAIL" 
              className="px-3 py-2 font-sans font-bold text-xs outline-none border-2 w-full transition-colors placeholder:opacity-70"
              style={{ 
                borderColor: product.textColor, 
                color: product.textColor,
                backgroundColor: 'transparent'
              }}
            />
            <button 
              type="submit"
              className="px-3 py-2 font-anton tracking-wider text-sm uppercase whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: product.textColor, 
                color: product.bgColor 
              }}
            >
              JOIN WAITLIST
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
