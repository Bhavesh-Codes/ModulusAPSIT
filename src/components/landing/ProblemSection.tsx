"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  easeInOut,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface Pose { x: number; y: number; r: number }

interface Tile {
  id: string;
  bg: string;
  logo: ReactNode;
  scatter: Pose; // x / y as a fraction of the stage width / height, from its centre
  pile: Pose;    // px offset of the final heap
  still: Pose;   // px offset used by the static (reduced-motion) pile
}

const tiles: Tile[] = [
  {
    id: "whatsapp",
    bg: "bg-white",
    scatter: { x: -0.38, y: -0.3, r: -24 },
    pile: { x: -14, y: -12, r: -10 },
    still: { x: -60, y: -46, r: -12 },
    logo: (
      <svg viewBox="0 0 24 24" className="brand-logo whatsapp-logo w-[60%] h-auto flex-shrink-0" fill="none">
        <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    id: "drive",
    bg: "bg-white",
    scatter: { x: 0.36, y: -0.34, r: 20 },
    pile: { x: 16, y: -8, r: 8 },
    still: { x: 64, y: -38, r: 8 },
    logo: (
      <svg viewBox="0 0 87.3 78" className="brand-logo drive-logo w-[68%] h-auto flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
      </svg>
    ),
  },
  {
    id: "gmail",
    bg: "bg-white",
    scatter: { x: -0.26, y: 0.32, r: 14 },
    pile: { x: -10, y: 12, r: -4 },
    still: { x: -42, y: 40, r: -4 },
    logo: (
      <svg viewBox="52 42 88 66" className="brand-logo gmail-logo w-[68%] h-auto flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
        <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
        <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
        <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
        <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
      </svg>
    ),
  },
  {
    id: "telegram",
    bg: "bg-[#26A5E4]",
    scatter: { x: 0.3, y: 0.28, r: -16 },
    pile: { x: 14, y: 14, r: 5 },
    still: { x: 58, y: 50, r: 5 },
    logo: (
      <svg viewBox="3.5 4.5 16 16" className="brand-logo telegram-logo w-[60%] h-auto flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#ffffff" d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

const tileBox =
  "absolute left-1/2 top-1/2 rounded-[1.2rem] border-[3px] border-foreground shadow-[4px_4px_0px_var(--shadow-color)] flex items-center justify-center";

// Tiles grow on larger screens in the scroll version; the static version stays small.
const tileSizeScrolly = "w-20 h-20 -ml-10 -mt-10 md:w-28 md:h-28 md:-ml-14 md:-mt-14";
const tileSizeStatic = "w-20 h-20 -ml-10 -mt-10";

const logoPill =
  "font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-foreground px-6 py-2 bg-[#FFD600] rounded-[2rem] border-[3px] border-foreground shadow-[8px_8px_0px_var(--shadow-color)] inline-block";

// ---------------------------------------------------------------------------
// Scroll-driven version
// ---------------------------------------------------------------------------

// Size of the stage box. The icons are positioned relative to it, not the window,
// so the layout stays compact and mobile browser-bar resizes cause no re-renders.
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 880, h: 400 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

// Scroll progress (0..1) at which each beat happens.
const BEAT = { gather: 0.1, together: 0.44, hold: 0.6, collapsed: 0.74 };

function ScrollTile({ tile, index, p, w, h, k }: { tile: Tile; index: number; p: MotionValue<number>; w: number; h: number; k: number }) {
  const stops = [0, BEAT.gather + index * 0.02, BEAT.together + index * 0.025, BEAT.hold, BEAT.collapsed];
  const opts = { ease: easeInOut };
  const sx = tile.scatter.x * w * (w < 640 ? 0.78 : 1); // keep tiles on screen on phones
  const sy = tile.scatter.y * h;
  const px = tile.pile.x * k;
  const py = tile.pile.y * k;

  const x = useTransform(p, stops, [sx, sx, px, px, 0], opts);
  const y = useTransform(p, stops, [sy, sy, py, py, 0], opts);
  const rotate = useTransform(p, stops, [tile.scatter.r, tile.scatter.r, tile.pile.r, tile.pile.r, tile.pile.r + 45], opts);
  const scale = useTransform(p, stops, [1, 1, 1, 1, 0], opts);
  const opacity = useTransform(p, stops, [1, 1, 1, 1, 0]);

  return (
    <motion.div
      className={`${tileBox} ${tileSizeScrolly} ${tile.bg}`}
      style={{ x, y, rotate, scale, opacity, zIndex: index + 1, willChange: "transform" }}
    >
      {tile.logo}
    </motion.div>
  );
}

function ScrollyProblem() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // A light spring keeps the motion smooth and lets it run backwards when scrolling up.
  const p = useSpring(scrollYProgress, { stiffness: 170, damping: 30, mass: 0.35, restDelta: 0.0005 });
  const [stageRef, { w, h }] = useElementSize<HTMLDivElement>();
  const k = w >= 640 ? 1.4 : 1; // heap offsets scale with the larger tiles

  // Copy: each line fades in and out in its own range of the scroll.
  const t1Opacity = useTransform(p, [0, 0.26, 0.32], [1, 1, 0]);
  const t1Y = useTransform(p, [0.26, 0.32], [0, -14]);
  const t2Opacity = useTransform(p, [0.34, 0.4, 0.58, 0.64], [0, 1, 1, 0]);
  const t2Y = useTransform(p, [0.34, 0.4, 0.58, 0.64], [14, 0, 0, -14]);
  const t3Opacity = useTransform(p, [0.76, 0.84], [0, 1]);
  const t3Y = useTransform(p, [0.76, 0.84], [14, 0]);

  const logoOpacity = useTransform(p, [0.7, 0.78], [0, 1]);
  const logoScale = useTransform(p, [0.7, 0.8, 0.9], [0.3, 1.08, 1]);
  const hintOpacity = useTransform(p, [0, 0.07], [1, 0]);

  const copy = "col-start-1 row-start-1 max-w-4xl font-display text-balance text-foreground";

  return (
    <section ref={ref} className="relative h-[250vh] md:h-[270vh] bg-background w-full">
      <div className="sticky top-0 h-svh overflow-hidden flex flex-col items-center justify-center gap-6 md:gap-10 px-4 pt-20 pb-10">
        {/* Changing copy */}
        <div className="grid place-items-center text-center">
          <motion.h2 style={{ opacity: t1Opacity, y: t1Y }} className={`${copy} font-extrabold text-3xl sm:text-5xl lg:text-6xl`}>
            Notes are scattered across chats, inboxes and drives.
          </motion.h2>
          <motion.p style={{ opacity: t2Opacity, y: t2Y }} className={`${copy} font-extrabold text-3xl sm:text-5xl lg:text-6xl`}>
            Bring them into one place.
          </motion.p>
          <motion.p style={{ opacity: t3Opacity, y: t3Y }} className={`${copy} font-bold text-2xl sm:text-4xl lg:text-5xl`}>
            One place. Organised. Searchable.
          </motion.p>
        </div>

        {/* Stage: icons gather, collapse, and the logo takes their place */}
        <div ref={stageRef} className="relative w-full max-w-5xl h-[min(46svh,26rem)]" aria-hidden="true">
          {tiles.map((tile, i) => (
            <ScrollTile key={tile.id} tile={tile} index={i} p={p} w={w} h={h} k={k} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.span style={{ opacity: logoOpacity, scale: logoScale, willChange: "transform" }} className={logoPill}>
              MODULUS
            </motion.span>
          </div>
        </div>

        <motion.div
          style={{ opacity: hintOpacity }}
          aria-hidden="true"
          className="absolute bottom-6 inset-x-0 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground"
        >
          Scroll
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Reduced-motion version: the same story as one still frame
// ---------------------------------------------------------------------------

function StaticProblem() {
  return (
    <section className="bg-background py-24 md:py-32 flex flex-col items-center w-full overflow-hidden">
      <h2 className="max-w-3xl px-4 text-center font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-16">
        Notes are scattered across chats, inboxes and drives.
      </h2>
      <div className="relative w-full max-w-sm h-[280px]" aria-hidden="true">
        {tiles.map((tile, i) => (
          <div
            key={tile.id}
            className={`${tileBox} ${tileSizeStatic} ${tile.bg}`}
            style={{ transform: `translate(${tile.still.x}px, ${tile.still.y}px) rotate(${tile.still.r}deg)`, zIndex: i + 1 }}
          >
            {tile.logo}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center px-4 text-center mt-8">
        <span className={`${logoPill} mb-6`}>MODULUS</span>
        <p className="font-display font-bold text-2xl md:text-3xl text-foreground">One place. Organised. Searchable.</p>
      </div>
    </section>
  );
}

export default function ProblemSection() {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? <StaticProblem /> : <ScrollyProblem />;
}
