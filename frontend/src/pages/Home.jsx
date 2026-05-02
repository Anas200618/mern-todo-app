import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle2,
  CalendarDays,
  LayoutGrid,
  ShieldCheck,
  BarChart2,
  Zap,
  ArrowRight,
  Star,
  Users,
  Layers,
  TrendingUp,
  CheckCheck,
  Menu,
  X,
} from "lucide-react";

const features = [
  {
    Icon: ClipboardList,
    title: "Task Management",
    desc: "Create, edit, and prioritize tasks with rich descriptions, labels, and custom fields tailored to your workflow.",
    color: "#3b82f6",
    ringColor: "rgba(59,130,246,0.15)",
  },
  {
    Icon: CheckCircle2,
    title: "Track Progress",
    desc: "Mark tasks complete, view streaks, and get a bird's-eye view of everything you've accomplished.",
    color: "#10b981",
    ringColor: "rgba(16,185,129,0.15)",
  },
  {
    Icon: CalendarDays,
    title: "Due Dates",
    desc: "Never miss a deadline. Set dates, get reminders, and auto-sort tasks by urgency.",
    color: "#f59e0b",
    ringColor: "rgba(245,158,11,0.15)",
  },
  {
    Icon: LayoutGrid,
    title: "Categorization",
    desc: "Organize with custom categories, color-coded tags, and smart filters that adapt to how you think.",
    color: "#8b5cf6",
    ringColor: "rgba(139,92,246,0.15)",
  },
  {
    Icon: ShieldCheck,
    title: "Multi-Tenant Security",
    desc: "Your data is always private. Each account is fully isolated with enterprise-grade security standards.",
    color: "#ef4444",
    ringColor: "rgba(239,68,68,0.15)",
  },
  {
    Icon: BarChart2,
    title: "Analytics & Insights",
    desc: "See how productive you've been with weekly summaries, completion rates, and trend charts.",
    color: "#06b6d4",
    ringColor: "rgba(6,182,212,0.15)",
  },
];

const steps = [
  {
    step: "01",
    Icon: Users,
    title: "Create your account",
    desc: "Sign up in seconds — no credit card required. Your personal dashboard is ready instantly.",
    detail: "Free forever on the basic plan.",
  },
  {
    step: "02",
    Icon: ClipboardList,
    title: "Add your first tasks",
    desc: "Type your to-dos, assign deadlines, pick categories, and set priorities all from one clean interface.",
    detail: "Import from Notion, Todoist, and more.",
  },
  {
    step: "03",
    Icon: CheckCheck,
    title: "Work & check off",
    desc: "Focus on what matters. Check off tasks as you complete them and watch your progress build.",
    detail: "Keyboard shortcuts for power users.",
  },
  {
    step: "04",
    Icon: TrendingUp,
    title: "Review & improve",
    desc: "Weekly digests and analytics show you where you're crushing it — and where to level up.",
    detail: "Exportable reports included.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Product Designer",
    avatar: "PS",
    text: "Finally a to-do app that doesn't get in the way. Clean, fast, and actually helps me ship more.",
    color: "#8b5cf6",
    bgAlpha: "rgba(139,92,246,0.15)",
    borderAlpha: "rgba(139,92,246,0.25)",
  },
  {
    name: "Marcus Chen",
    role: "Freelance Developer",
    avatar: "MC",
    text: "The category system is a game-changer. I manage three clients' projects without breaking a sweat.",
    color: "#0ea5e9",
    bgAlpha: "rgba(14,165,233,0.15)",
    borderAlpha: "rgba(14,165,233,0.25)",
  },
  {
    name: "Aisha Okonkwo",
    role: "Startup Founder",
    avatar: "AO",
    text: "I've tried them all. This one sticks. The analytics alone are worth it — I can see exactly where my week went.",
    color: "#10b981",
    bgAlpha: "rgba(16,185,129,0.15)",
    borderAlpha: "rgba(16,185,129,0.25)",
  },
];

const stats = [
  { value: "50K+", label: "Active Users", Icon: Users },
  { value: "2M+", label: "Tasks Completed", Icon: CheckCircle2 },
  { value: "99.9%", label: "Uptime SLA", Icon: ShieldCheck },
  { value: "4.9", label: "Average Rating", Icon: Star, isStar: true },
];

function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <span ref={ref}>{visible ? value : "—"}</span>;
}

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="min-h-screen bg-[#0b0f1a] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden"
    >
      {/* Sticky Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0b0f1a]/95 backdrop-blur-md border-b border-white/10 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <button className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
                Log In
              </button>
            </Link>
            <Link to="/register">
              <button className="text-sm bg-blue-600 hover:bg-blue-500 transition-colors font-semibold px-5 py-2 rounded-lg flex items-center gap-1.5">
                Get Started <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f1422] border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">Features</a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">How it works</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">Reviews</a>
            <div className="flex gap-3 pt-2 border-t border-white/10">
              <Link to="/login" className="flex-1">
                <button className="w-full py-2 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">Log In</button>
              </Link>
              <Link to="/register" className="flex-1">
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all">Get Started</button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <header className="relative flex flex-col items-center justify-center px-6 pt-40 pb-28 text-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #3b82f6 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-60 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #10b981 0%, transparent 70%)" }}
        />

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full">
          <Zap size={12} className="text-blue-400" />
          Now with AI-powered task suggestions
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-[1.08] tracking-tight max-w-4xl">
          Organize your work.
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Actually get things done.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          TaskFlow is a powerful, multi-tenant task manager built on the MERN stack. Deadlines, categories,
          progress tracking — everything in one place, beautifully organized.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link to="/register">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all font-semibold rounded-xl shadow-xl shadow-blue-600/30 text-base flex items-center gap-2 justify-center">
              Start for free <ArrowRight size={16} />
            </button>
          </Link>
          <a href="#how">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 active:scale-95 transition-all font-semibold rounded-xl border border-white/10 text-base text-gray-300">
              See how it works
            </button>
          </a>
        </div>

        <p className="mt-5 text-xs text-gray-600">No credit card required · Free plan available · Setup in 60 seconds</p>

        {/* Task preview card */}
        <div className="mt-16 w-full max-w-lg mx-auto bg-[#131827] border border-white/10 rounded-2xl p-5 text-left shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <div className="w-3 h-3 rounded-full bg-green-400/60" />
            <span className="ml-2 text-xs text-gray-500">My Tasks — Today</span>
          </div>
          {[
            { label: "Design new dashboard mockup", done: true, tag: "Design", color: "bg-purple-500/20 text-purple-300" },
            { label: "Review pull requests #42 & #43", done: true, tag: "Dev", color: "bg-blue-500/20 text-blue-300" },
            { label: "Write weekly team update", done: false, tag: "Comms", color: "bg-yellow-500/20 text-yellow-300" },
            { label: "Prep Q3 performance report", done: false, tag: "Reports", color: "bg-emerald-500/20 text-emerald-300" },
          ].map((task, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 ${task.done ? "opacity-50" : ""}`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  task.done ? "bg-emerald-500 border-emerald-500" : "border-gray-600"
                }`}
              >
                {task.done && <CheckCheck size={10} className="text-white" />}
              </div>
              <span className={`flex-1 text-sm ${task.done ? "line-through text-gray-500" : "text-gray-200"}`}>
                {task.label}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${task.color}`}>
                {task.tag}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Stats Bar */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label, Icon: StatIcon, isStar }, i) => (
            <div key={i} className="text-center flex flex-col items-center gap-2">
              <StatIcon size={18} className="text-gray-500" />
              <div className="flex items-center justify-center gap-1 text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                <AnimatedNumber value={value} />
                {isStar && <Star size={18} className="text-yellow-400 fill-yellow-400 ml-1" style={{ background: "none", WebkitBackgroundClip: "unset", WebkitTextFillColor: "unset" }} />}
              </div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">Everything you need</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Powerful features, zero friction</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
              Built for individuals and teams who are serious about getting things done without drowning in complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ Icon: FeatIcon, title, desc, color, ringColor }, i) => (
              <div
                key={i}
                className="group bg-[#131827] hover:bg-[#161e30] border border-white/8 hover:border-white/20 rounded-2xl p-6 transition-all duration-200"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: ringColor, border: `1px solid ${color}33` }}
                >
                  <FeatIcon size={22} style={{ color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="px-6 py-24 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Simple process</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Up and running in minutes</h2>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-600 via-cyan-500 to-emerald-500 opacity-30 hidden md:block" />

            <div className="space-y-6">
              {steps.map(({ step, Icon: StepIcon, title, desc, detail }, i) => (
                <div key={i} className="flex items-start gap-6 bg-[#131827] border border-white/8 rounded-2xl p-6 md:ml-16 relative">
                  <div className="hidden md:flex absolute -left-16 -translate-x-1/2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0b0f1a] border border-white/20 items-center justify-center">
                    <StepIcon size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-shrink-0 text-3xl font-black text-white/10 leading-none select-none hidden sm:block">
                    {step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-2">{desc}</p>
                    <span className="inline-block text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-0.5">
                      {detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">Loved by users</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Don't just take our word for it</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[#131827] border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: t.bgAlpha, color: t.color, border: `1px solid ${t.borderAlpha}` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-600 p-12 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 relative">
            Ready to take control of your day?
          </h2>
          <p className="text-white/80 text-lg mb-8 relative max-w-lg mx-auto">
            Join 50,000+ people who use TaskFlow to focus on what matters and leave chaos behind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
            <Link to="/register">
              <button className="px-8 py-3.5 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 transition-all font-bold rounded-xl shadow-xl text-base flex items-center gap-2 justify-center">
                Create Free Account <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/login">
              <button className="px-8 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all font-semibold rounded-xl border border-white/30 text-base">
                Log In
              </button>
            </Link>
          </div>
          <p className="mt-5 text-white/50 text-xs">No credit card · Free plan forever · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-600">
          
          {/* Brand & Developer Info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600/80 flex items-center justify-center">
                <Layers size={12} className="text-white" />
              </div>
              <span className="font-semibold text-gray-400">TaskFlow</span>
              <span className="hidden sm:inline text-gray-700">|</span>
              <span className="text-blue-400/80">Developed by Mohammad Anas Mansuri</span>
            </div>
            <p className="text-xs text-gray-700 mt-1">Built with the MERN Stack & Tailwind CSS</p>
          </div>

          {/* Quick Links */}
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
            <Link to="/login" className="hover:text-gray-400 transition-colors">Log In</Link>
            <Link to="/register" className="hover:text-gray-400 transition-colors">Sign Up</Link>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 font-medium">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;