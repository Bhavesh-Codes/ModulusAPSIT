"use client";

const platforms = [
  { label: "WhatsApp", emoji: "💬", color: "bg-[#25D366]" },
  { label: "Email", emoji: "📧", color: "bg-[#EA4335]" },
  { label: "Google Drive", emoji: "☁️", color: "bg-[#4285F4]" },
  { label: "Telegram", emoji: "✈️", color: "bg-[#2CA5E0]" },
  { label: "Pen drive", emoji: "💾", color: "bg-foreground" },
];

export default function ProblemSection() {
  return (
    <section className="bg-background py-24 md:py-32 relative flex flex-col items-center justify-center overflow-hidden w-full">

      {/* Problem */}
      <div className="flex flex-col items-center w-full max-w-4xl px-4 text-center mb-16 md:mb-24">
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-16">
          Notes are scattered across chats, inboxes and drives.
        </h2>

        {/* Platform chips */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {platforms.map((p) => (
            <div
              key={p.label}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-[1.2rem] border-[3px] border-foreground shadow-[4px_4px_0px_var(--shadow-color,black)] ${p.color} text-white font-display font-bold text-base`}
            >
              <span role="img" aria-label={p.label}>{p.emoji}</span>
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
