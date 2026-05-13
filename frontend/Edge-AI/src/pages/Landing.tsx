import { Link } from "react-router-dom";
import { Cpu, Brain, AlertTriangle, Shield, ArrowRight, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Monitor, title: "Real-Time Monitoring", desc: "Continuous system performance tracking with live metric updates." },
  { icon: Cpu, title: "CPU & Memory Tracking", desc: "Deep visibility into resource consumption across all running processes." },
  { icon: Brain, title: "Early Anomaly Detection", desc: "Intelligent detection identifies unusual patterns before they escalate." },
  { icon: AlertTriangle, title: "Critical Alert Prediction", desc: "Predictive severity analysis to prevent system failures proactively." },
];

export default function Landing() {
  return (
    <Layout>
      {/* Hero with background image */}
      <section className="relative overflow-hidden rounded-2xl min-h-[480px] flex items-center">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={960} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        <div className="relative z-10 px-8 py-20 sm:px-14 max-w-2xl">
          <h1 className="mb-4 text-4xl font-black tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl leading-tight">
            Autonomous Agentic AI<br />Operations Analyst
          </h1>
          <div className="w-16 h-1 bg-primary mb-6 rounded-full" />
          <p className="text-lg font-medium text-primary-foreground/80 mb-3">
            Three Decades of Innovation. One Intelligent Monitoring System.
          </p>
          <p className="text-base text-primary-foreground/60 mb-10 max-w-xl">
            An Edge AI system that monitors system performance, detects anomalies,
            and predicts critical failures — all running locally on your machine.
            Built for operations teams who need proactive, autonomous monitoring.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 text-base px-8 py-6 rounded-lg font-bold uppercase tracking-wide">
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-lg font-bold uppercase tracking-wide border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mt-20 text-center">
        <h2 className="mb-4 text-3xl font-bold text-foreground">Intelligent Edge Monitoring</h2>
        <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full" />
        <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
          Our system leverages Edge AI to perform real-time anomaly detection directly on your device.
          By analyzing CPU, memory, and disk patterns, it identifies threats early and predicts severity
          levels — enabling proactive response before critical failures occur.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="mt-16 grid gap-6 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group glass-card p-6 transition-all duration-300 hover:shadow-md hover:bg-card-hover"
          >
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-20 rounded-2xl bg-primary/5 border border-primary/20 p-10 text-center">
        <Shield className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="mb-3 text-2xl font-bold text-foreground">Protect Your System Today</h2>
        <p className="mb-6 text-muted-foreground">Start monitoring with intelligent anomaly detection.</p>
        <Link to="/dashboard">
          <Button size="lg" className="gap-2 rounded-lg uppercase font-bold tracking-wide">
            Launch Dashboard <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-border pt-8 pb-6 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">EdgeAI Monitor</p>
        <p>© {new Date().getFullYear()} EdgeAI Operations. Built for autonomous system monitoring.</p>
      </footer>
    </Layout>
  );
}
