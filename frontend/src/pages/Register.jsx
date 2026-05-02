import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  User, Mail, Lock, Eye, EyeOff, AlertTriangle,
  ArrowRight, Layers, Loader2, ChevronLeft, CheckCircle2,
  ShieldCheck, X,
} from "lucide-react";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UPPER_RE   = /[A-Z]/;
const LOWER_RE   = /[a-z]/;
const NUMBER_RE  = /[0-9]/;
const SPECIAL_RE = /[^A-Za-z0-9]/;
const NAME_RE    = /^[A-Za-z\s'-]+$/;

// ─────────────────────────────────────────────
//  Validation rules
// ─────────────────────────────────────────────
const RULES = {
  fullName: (v) => {
    const s = (v || "").trim();
    if (!s)              return "Full name is required.";
    if (!NAME_RE.test(s)) return "Name can only contain letters, spaces, hyphens, or apostrophes.";
    if (s.length < 2)    return "Name must be at least 2 characters.";
    if (s.length > 60)   return "Name cannot exceed 60 characters.";
    if (!s.includes(" ")) return "Please enter your first and last name.";
    return "";
  },
  email: (v) => {
    const s = (v || "").trim();
    if (!s)               return "Email address is required.";
    if (!EMAIL_RE.test(s)) return "Enter a valid email address.";
    return "";
  },
  password: (v) => {
    if (!v)           return "Password is required.";
    if (v.length < 8) return "Must be at least 8 characters.";
    if (!UPPER_RE.test(v))   return "Include at least one uppercase letter.";
    if (!LOWER_RE.test(v))   return "Include at least one lowercase letter.";
    if (!NUMBER_RE.test(v))  return "Include at least one number.";
    if (!SPECIAL_RE.test(v)) return "Include at least one special character.";
    return "";
  },
  confirmPassword: (v, all) => {
    if (!v)                   return "Please confirm your password.";
    if (v !== all.password)   return "Passwords do not match.";
    return "";
  },
};

function validate(name, value, all = {}) {
  return RULES[name] ? RULES[name](value, all) : "";
}

function validateAll(data) {
  const errs = {};
  Object.keys(RULES).forEach((k) => {
    const e = RULES[k](data[k], data);
    if (e) errs[k] = e;
  });
  return errs;
}

// ─────────────────────────────────────────────
//  Password strength engine
// ─────────────────────────────────────────────
const STRENGTH_CHECKS = [
  { key: "len",     label: "8+ characters",       test: (p) => p.length >= 8         },
  { key: "upper",   label: "Uppercase letter",     test: (p) => UPPER_RE.test(p)      },
  { key: "lower",   label: "Lowercase letter",     test: (p) => LOWER_RE.test(p)      },
  { key: "number",  label: "Number",               test: (p) => NUMBER_RE.test(p)     },
  { key: "special", label: "Special character",    test: (p) => SPECIAL_RE.test(p)    },
];

const STRENGTH_LEVELS = [
  { label: "Too weak",  bar: "bg-rose-500",   text: "text-rose-400"   },
  { label: "Weak",      bar: "bg-orange-500",  text: "text-orange-400" },
  { label: "Fair",      bar: "bg-amber-400",   text: "text-amber-400"  },
  { label: "Good",      bar: "bg-blue-400",    text: "text-blue-400"   },
  { label: "Strong",    bar: "bg-emerald-500", text: "text-emerald-400" },
];

function getStrength(password) {
  if (!password) return { score: 0, checks: STRENGTH_CHECKS.map((c) => ({ ...c, met: false })) };
  const checks = STRENGTH_CHECKS.map((c) => ({ ...c, met: c.test(password) }));
  const score  = checks.filter((c) => c.met).length;
  return { score, checks };
}

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────

/** Inline field error */
const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-1.5 animate-fadeIn">
      <AlertTriangle size={10} className="flex-shrink-0" />
      {msg}
    </p>
  ) : null;

/** Password strength meter */
function StrengthMeter({ password }) {
  if (!password) return null;
  const { score, checks } = getStrength(password);
  const level = STRENGTH_LEVELS[Math.min(score, 4)];

  return (
    <div className="mt-2.5 space-y-2 animate-fadeIn">
      {/* Progress bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              lvl <= score ? level.bar : "bg-white/[0.06]"
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold ${level.text}`}>{level.label}</span>
        <span className="text-[10px] text-gray-600">{score}/5 requirements</span>
      </div>

      {/* Requirement checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-0.5">
        {checks.map((c) => (
          <span
            key={c.key}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              c.met ? "text-emerald-400" : "text-gray-600"
            }`}
          >
            {c.met ? (
              <CheckCircle2 size={10} className="flex-shrink-0" />
            ) : (
              <div className="w-[10px] h-[10px] rounded-full border border-gray-700 flex-shrink-0" />
            )}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Confirm password match indicator */
function MatchIndicator({ password, confirm }) {
  if (!confirm || !password) return null;
  const match = password === confirm;
  return (
    <p className={`flex items-center gap-1.5 text-[11px] mt-1.5 font-medium animate-fadeIn ${match ? "text-emerald-400" : "text-rose-400"}`}>
      {match ? <CheckCircle2 size={10} /> : <X size={10} />}
      {match ? "Passwords match" : "Passwords do not match"}
    </p>
  );
}

// ─────────────────────────────────────────────
//  Input field wrapper
// ─────────────────────────────────────────────
function Field({ label, error, touched, required, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-rose-500 normal-case tracking-normal font-bold">*</span>}
      </label>
      {children}
      {touched && <FieldError msg={error} />}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Register Page
// ─────────────────────────────────────────────
export default function Register() {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [dirty, setDirty]       = useState(false);          // true after first submit attempt
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [serverErr, setServerErr] = useState("");

  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // ── field update ────────────────────────────
  const set = useCallback((name, value) => {
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (dirty || touched[name]) {
        setErrors((e) => ({
          ...e,
          [name]: validate(name, value, next),
          // re-validate confirm whenever password changes
          ...(name === "password" && next.confirmPassword
            ? { confirmPassword: validate("confirmPassword", next.confirmPassword, next) }
            : {}),
        }));
      }
      return next;
    });
    if (serverErr) setServerErr("");
  }, [dirty, touched, serverErr]);

  const blur = useCallback((name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: validate(name, form[name], form) }));
  }, [form]);

  // ── submit ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDirty(true);
    const errs = validateAll(form);
    setErrors(errs);
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerErr("");
    try {
      const res  = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.fullName.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed. Please try again.");
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── helpers ─────────────────────────────────
  const inputCls = (name) =>
    `w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-[#0d1120] border text-sm text-gray-200 placeholder-gray-600 outline-none transition-all focus:ring-2 ${
      touched[name] && errors[name]
        ? "border-rose-500/50 focus:border-rose-500/70 focus:ring-rose-500/10"
        : touched[name] && !errors[name]
        ? "border-emerald-500/40 focus:border-emerald-500/60 focus:ring-emerald-500/10"
        : "border-white/[0.08] focus:border-blue-500/50 focus:ring-blue-500/10"
    }`;

  const hasErrors = Object.keys(errors).length > 0;

  // ─────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn  { animation: fadeIn  .18s ease both; }
        .animate-slideUp { animation: slideUp .3s ease both; }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-[#060912] text-gray-200 px-4 py-8 sm:py-12 relative overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-emerald-600/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-white/[0.02]" />
        </div>

        <div className="w-full max-w-md z-10 animate-slideUp">

          {/* Back link */}
          <Link to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 mb-6 group transition-colors">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-7">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Layers size={16} className="text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
              TaskFlow
            </span>
          </div>

          {/* Card */}
          <div className="bg-[#0f1520]/80 backdrop-blur-2xl border border-white/[0.07] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">

            {/* Header */}
            <div className="text-center mb-6 sm:mb-7">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={20} className="text-blue-400" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-100 tracking-tight">Create your account</h1>
              <p className="text-xs text-gray-500 mt-1">Join thousands of productive teams today</p>
            </div>

            {/* Server error banner */}
            {serverErr && (
              <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 mb-5 rounded-xl text-xs animate-fadeIn">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <p className="flex-1 leading-snug">{serverErr}</p>
                <button onClick={() => setServerErr("")} className="flex-shrink-0 opacity-60 hover:opacity-100">
                  <X size={13} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* ── Full Name ── */}
              <Field label="Full Name" error={errors.fullName} touched={touched.fullName} required>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input
                    ref={nameRef}
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    className={inputCls("fullName")}
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    onBlur={() => blur("fullName")}
                    maxLength={60}
                  />
                  {touched.fullName && !errors.fullName && form.fullName && (
                    <CheckCircle2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                  )}
                </div>
              </Field>

              {/* ── Email ── */}
              <Field label="Email Address" error={errors.email} touched={touched.email} required>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@example.com"
                    className={inputCls("email")}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => blur("email")}
                  />
                  {touched.email && !errors.email && form.email && (
                    <CheckCircle2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                  )}
                </div>
              </Field>

              {/* ── Password ── */}
              <Field label="Password" error={errors.password} touched={touched.password} required>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    className={inputCls("password")}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    onBlur={() => blur("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength meter — shows as soon as user starts typing */}
                {form.password && <StrengthMeter password={form.password} />}
                {/* Error only if no password or strength meter won't cover it */}
                {touched.password && errors.password && !form.password && (
                  <FieldError msg={errors.password} />
                )}
              </Field>

              {/* ── Confirm Password ── */}
              <Field label="Confirm Password" error={errors.confirmPassword} touched={touched.confirmPassword && form.confirmPassword !== form.password} required>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input
                    name="confirmPassword"
                    type={showConf ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    className={inputCls("confirmPassword")}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    onBlur={() => blur("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showConf ? "Hide password" : "Show password"}
                  >
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Match indicator replaces the generic error */}
                {form.confirmPassword && (
                  <MatchIndicator password={form.password} confirm={form.confirmPassword} />
                )}
                {/* Only show error if field is empty on blur */}
                {touched.confirmPassword && !form.confirmPassword && (
                  <FieldError msg={errors.confirmPassword} />
                )}
              </Field>

              {/* ── Submit ── */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-lg shadow-blue-600/20 border border-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                  ) : (
                    <>Get Started Free <ArrowRight size={15} /></>
                  )}
                </button>

                {/* Validation hint shown on failed submit */}
                {dirty && hasErrors && (
                  <p className="text-center text-[11px] text-rose-400 mt-2.5 animate-fadeIn">
                    Please fix the errors above before continuing.
                  </p>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-xs text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>

          {/* Terms note */}
          <p className="text-center text-[11px] text-gray-700 mt-4 px-4">
            By creating an account you agree to our{" "}
            <a href="#" className="text-gray-600 hover:text-gray-500 underline underline-offset-2">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-gray-600 hover:text-gray-500 underline underline-offset-2">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </>
  );
}