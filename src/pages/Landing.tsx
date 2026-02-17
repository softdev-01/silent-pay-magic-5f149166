import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, Shield, CreditCard, ArrowRight } from "lucide-react";

const features = [
  { icon: <Zap className="h-6 w-6" />, title: "Invisible Payments", desc: "Link once, pay automatically. No buttons, no friction." },
  { icon: <Shield className="h-6 w-6" />, title: "Tokenized Security", desc: "PCI-DSS compliant vaulting. Your wallet credentials are never stored." },
  { icon: <CreditCard className="h-6 w-6" />, title: "Smart Invoicing", desc: "Automatic invoice generation and background deductions via PayPal." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="flex items-center justify-between border-b px-6 py-4 lg:px-16">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">InvisiPay</span>
        </div>
        <Button onClick={() => navigate("/login")} variant="outline">Sign In</Button>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center lg:py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">Invisible Payment System</p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
            Payments that happen<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">in the background</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Link your PayPal wallet once. After that, every service you use is automatically billed — no pop-ups, no checkout pages, no friction.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/login")} className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
              View Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
