const ROWS = [
  {
    dir: "left" as const,
    reviews: [
      { name: "Sofia R.", avatar: "💗", stars: 5, text: "She literally cried opening it. Best $5 I've ever spent." },
      { name: "James K.", avatar: "💌", stars: 5, text: "The mailbox animation had her completely speechless." },
      { name: "Priya M.", avatar: "🌸", stars: 5, text: "I sent this for our anniversary — he called me immediately crying happy tears." },
      { name: "Daniel T.", avatar: "💍", stars: 5, text: "She said YES after I sent her this. I'm not even joking." },
      { name: "Aisha L.", avatar: "✨", stars: 5, text: "Way more personal than a text. She still re-reads it every week." },
      { name: "Marco F.", avatar: "🎶", stars: 5, text: "The music playing while she read the letter… perfect touch." },
    ],
  },
  {
    dir: "right" as const,
    reviews: [
      { name: "Hannah B.", avatar: "🌹", stars: 5, text: "My boyfriend said it was the most thoughtful thing anyone had ever done for him." },
      { name: "Luca S.", avatar: "💞", stars: 5, text: "Absolutely beautiful. The envelope reveal made her gasp out loud." },
      { name: "Emma W.", avatar: "🥹", stars: 5, text: "I didn't expect to cry making it but here we are. 10/10 recommend." },
      { name: "Carlos D.", avatar: "🎁", stars: 5, text: "She shared it with all her friends. Wish4Love is genuinely special." },
      { name: "Yuki T.", avatar: "🌷", stars: 5, text: "Long distance relationship — this made 5,000 miles feel like nothing." },
      { name: "Natalie O.", avatar: "💫", stars: 5, text: "I've sent three letters already. Each one hits different. Worth every penny." },
    ],
  },
];

const TestimonialsMarquee = ({ className = "" }: { className?: string }) => (
  <div
    className={`w-full overflow-hidden ${className}`}
    style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
  >
    {ROWS.map(({ dir, reviews }) => (
      <div key={dir} className="flex mb-3 last:mb-0">
        <div
          className="flex gap-3"
          style={{ animation: `marquee-${dir} 40s linear infinite`, willChange: "transform" }}
        >
          {[...reviews, ...reviews].map((r, i) => (
            <div
              key={i}
              className="shrink-0 w-64 rounded-2xl bg-white border border-primary/10 px-4 py-3 text-left"
              style={{ boxShadow: "0 4px 16px hsl(340 60% 80% / 0.12)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl leading-none">{r.avatar}</span>
                <div>
                  <p className="font-display text-xs font-bold text-foreground">{r.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.stars }).map((_, s) => (
                      <span key={s} className="text-[10px] text-amber-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>
    ))}

    <style>{`
      @keyframes marquee-left {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes marquee-right {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }
    `}</style>
  </div>
);

export default TestimonialsMarquee;
