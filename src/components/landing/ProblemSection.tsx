"use client";

const platforms = [
  {
    label: "WhatsApp",
    color: "bg-[#25D366]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    label: "Email",
    color: "bg-[#EA4335]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" aria-hidden="true">
        <path d="M20 4H4C2.897 4 2 4.897 2 6v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2-8 5-8-5h16zm0 12H4V8.868l8 5 8-5V18z" />
      </svg>
    ),
  },
  {
    label: "Google Drive",
    color: "bg-[#4285F4]",
    icon: (
      <svg viewBox="0 0 87.3 78" className="w-5 h-5 shrink-0" aria-hidden="true">
        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47" />
        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 11.5z" fill="#ea4335" />
        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    color: "bg-[#2CA5E0]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    label: "Pen drive",
    color: "bg-foreground",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" aria-hidden="true">
        <path d="M17 2H7C5.897 2 5 2.897 5 4v6c0 1.103.897 2 2 2h1v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-9h1c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm-5 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4-11H8V4h8v4z" />
      </svg>
    ),
  },
];

export default function ProblemSection() {
  return (
    <section className="bg-background py-24 md:py-32 relative flex flex-col items-center justify-center overflow-hidden w-full">

      {/* Problem */}
      <div className="flex flex-col items-center w-full max-w-4xl px-4 text-center mb-16 md:mb-24">
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-16">
          Notes are scattered across chats, inboxes and drives.
        </h2>

        {/* Platform chips with official icons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {platforms.map((p) => (
            <div
              key={p.label}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-[1.2rem] border-[3px] border-foreground shadow-[4px_4px_0px_var(--shadow-color,black)] ${p.color} text-white font-display font-bold text-base`}
            >
              {p.icon}
              {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* Solution */}
      <div className="flex flex-col items-center w-full max-w-4xl px-4 text-center gap-6">
        <span className="font-display font-extrabold text-5xl md:text-7xl tracking-tighter text-foreground px-6 py-2 bg-[#FFD600] rounded-[2rem] border-[3px] border-foreground shadow-[8px_8px_0px_var(--shadow-color,black)] inline-block">
          MODULUS
        </span>
        <p className="font-display font-bold text-2xl md:text-3xl text-foreground">
          One place. Organised. Searchable.
        </p>
      </div>

    </section>
  );
}
