export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-black/10 dark:border-white/10">
        <span className="text-lg font-semibold tracking-tight">
          AI&nbsp;Consult
        </span>
        <nav className="flex gap-6 text-sm">
          <a href="#features" className="hover:underline">
            Features
          </a>
          <a href="#cta" className="hover:underline">
            Get Started
          </a>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-2xl">
          Expert consulting,
          <br />
          delivered on demand
        </h1>
        <p className="text-lg text-foreground/70 max-w-xl">
          Get actionable business insights in minutes, not weeks. AI&#8209;powered
          analysis paired with deep domain expertise — available whenever you
          need it.
        </p>
        <a
          href="#cta"
          className="mt-4 inline-flex items-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Start a consultation &rarr;
        </a>
      </main>

      {/* Features */}
      <section
        id="features"
        className="grid sm:grid-cols-3 gap-8 px-8 py-20 max-w-5xl mx-auto"
      >
        {[
          {
            title: "Instant Analysis",
            desc: "Upload your data or describe your challenge and receive a structured analysis within minutes.",
          },
          {
            title: "Domain Experts",
            desc: "Access specialists in strategy, operations, finance, and technology — on your schedule.",
          },
          {
            title: "Actionable Reports",
            desc: "Every engagement delivers clear recommendations you can act on immediately.",
          },
        ].map((f) => (
          <div key={f.title} className="space-y-2">
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-sm text-foreground/60">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="flex flex-col items-center gap-4 px-6 py-20 bg-foreground/[0.03]"
      >
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="text-foreground/60 text-sm max-w-md text-center">
          Sign up for early access and be the first to experience consulting
          reimagined.
        </p>
        <button className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
          Request early access
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-foreground/40 py-6">
        &copy; {new Date().getFullYear()} AI Consult. All rights reserved.
      </footer>
    </div>
  );
}
