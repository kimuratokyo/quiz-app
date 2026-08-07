import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const Latex = ({ children }: { children: string }) => {
  if (!children) return null;
  const parts = children.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          try {
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(math, { throwOnError: false }),
                }}
              />
            );
          } catch (e) {
            return <span key={index}>{part}</span>;
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export const SwipeCard = ({
  question,
  isAnimEnabled,
  showWatermarks,
  onNext,
  onPrev
}: {
  question: any;
  isAnimEnabled: boolean;
  showWatermarks: boolean;
  onNext: (dir: 'left' | 'right') => void;
  onPrev: (dir: 'left' | 'right') => void;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const nextOpacity = useTransform(x, [0, 100], [0, 1]);
  const bookmarkOpacity = useTransform(x, [0, -100], [0, 1]);
  
  const touchStartPos = useRef({ x: 0, y: 0 });
  const [flipCount, setFlipCount] = useState(0);

  if (!question) return null;

  return (
    <>
      <motion.div 
        className="w-full h-full max-h-[500px] relative z-10 touch-none select-none"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragEnd={(_, { offset, velocity }) => {
          if (offset.x > 20 || velocity.x > 100) {
            animate(x, window.innerWidth, {
              type: 'spring',
              velocity: Math.max(velocity.x, 800),
              stiffness: 200,
              damping: 25
            });
            onNext('right');
          } else if (offset.x < -20 || velocity.x < -100) {
            animate(x, -window.innerWidth, {
              type: 'spring',
              velocity: Math.min(velocity.x, -800),
              stiffness: 200,
              damping: 25
            });
            onPrev('left');
          }
        }}
        onPointerDown={(e) => { touchStartPos.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          const dx = e.clientX - touchStartPos.current.x;
          const dy = e.clientY - touchStartPos.current.y;
          if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            setFlipCount(prev => prev + 1);
          }
        }}
      >
        <motion.div 
          className="w-full h-full absolute inset-0 transform-style-3d"
          initial={false}
          animate={{ rotateY: isAnimEnabled ? flipCount * -180 : (flipCount % 2 !== 0 ? -180 : 0) }}
          transition={{ duration: isAnimEnabled ? 0.6 : 0, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Question */}
          <div className="absolute inset-0 backface-hidden bg-slate-800 border border-slate-700 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col group overflow-hidden">
            <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-20">
              <span className="text-sm font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">Question</span>
            </div>
            <div className="flex-grow flex items-center justify-center w-full z-10 relative pointer-events-none pt-12 pb-12">
              <h3 className="text-3xl sm:text-4xl leading-snug sm:leading-tight font-extrabold text-white tracking-tight text-center">
                <Latex>{question.question || ''}</Latex>
              </h3>
            </div>
          </div>

          {/* Answer */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-950 border border-indigo-500/50 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col group overflow-hidden">
            <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-20">
              <span className="text-sm font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 shadow-sm">Answer</span>
            </div>
            <div className="flex-grow flex flex-col justify-center w-full z-10 relative pointer-events-none pt-12 pb-12">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200 mb-8 pb-8 border-b border-white/10 leading-snug text-center">
                <Latex>{question.answer || ''}</Latex>
              </p>
              <div className="bg-black/30 rounded-2xl p-6 border border-white/5 relative">
                <span className="absolute -top-3 left-6 text-xs font-black tracking-widest text-slate-400 uppercase bg-[#0f172a] px-2">💡</span>
                <p className="text-slate-300 leading-relaxed sm:text-lg">
                  <Latex>{question.explanation || ''}</Latex>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Watermarks */}
      {showWatermarks && (
      <div className="absolute top-10 inset-x-0 h-40 z-50 pointer-events-none flex justify-center items-start overflow-hidden">
        <motion.div className="absolute border-[8px] sm:border-[10px] border-emerald-500 text-emerald-500 font-black text-4xl sm:text-5xl rounded-2xl px-8 py-4 transform -rotate-12 bg-slate-900/60 backdrop-blur-md"
          style={{ opacity: nextOpacity, textShadow: '0 4px 20px rgba(16,185,129,0.5)', boxShadow: '0 10px 40px rgba(16,185,129,0.3)' }}
        >
          NEXT
        </motion.div>
        <motion.div 
          className="absolute border-[8px] sm:border-[10px] border-rose-500 text-rose-500 font-black text-3xl sm:text-4xl rounded-2xl px-8 py-4 transform rotate-12 bg-slate-900/60 backdrop-blur-md"
          style={{ opacity: bookmarkOpacity, textShadow: '0 4px 20px rgba(244,63,94,0.5)', boxShadow: '0 10px 40px rgba(244,63,94,0.3)' }}
        >
          BOOKMARK
        </motion.div>
      </div>
      )}
    </>
  );
};
