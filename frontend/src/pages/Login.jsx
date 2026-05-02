import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Mail, Lock, Eye, EyeOff, AlertTriangle, 
  ArrowRight, Layers, Loader2, ChevronLeft 
} from "lucide-react";

/**
 * PURE VALIDATION LOGIC
 * Kept outside the component to prevent unnecessary re-creations during render,
 * and ensure it is testable.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateField = (name, value) => {
  if (name === "email") {
    const val = value.trim();
    if (!val) return "Email address is required";
    if (!EMAIL_REGEX.test(val)) return "Please enter a valid email address";
  }
  if (name === "password") {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
  }
  return "";
};

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const emailRef = useRef(null);

  // Focus the email field automatically on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear any previous server error when typing starts
    if (serverError) setServerError("");

    // Enable live validation only after the field has been touched
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Final pre-flight validation check
    const emailErr = validateField("email", formData.email);
    const passErr = validateField("password", formData.password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      // Normalize payload and trim spaces
      const payload = {
        email: formData.email.trim().toLowerCase(), 
        password: formData.password 
      };

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "We couldn't sign you in with those details.");
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldStyles = (name) => {
    const isInvalid = touched[name] && errors[name];
    const base = "w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[#0f1423] border text-sm text-gray-200 outline-none transition-all duration-300 focus:ring-4 ring-offset-[#070a14]";
    return `${base} ${isInvalid 
      ? "border-red-500/30 focus:ring-red-500/10 focus:border-red-500/50" 
      : "border-white/5 focus:border-blue-500/50 focus:ring-blue-500/10"}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070a14] text-gray-200 px-4 relative selection:bg-blue-500/30">
      
      {/* Ambient background glow for visual depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] left-1/3 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md z-10">
        
        {/* Simple navigation to go back */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-all duration-200 mb-6 ml-1 group font-medium"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Home
        </Link>

        {/* Branding header */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-600/20 ring-4 ring-white/5">
            <Layers size={18} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#131827]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-8 sm:p-10">
          
          <header className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-gray-100">Welcome back</h1>
            <p className="text-xs text-gray-400">Sign in to continue to your dashboard</p>
          </header>

          {/* Alert box for server errors */}
          {serverError && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-6 rounded-2xl text-xs backdrop-blur-sm">
              <AlertTriangle size={16} className="shrink-0" />
              <p className="flex-1 leading-snug">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-5">
            
            {/* Email Field with validation states */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className={getFieldStyles("email")}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              {touched.email && errors.email && (
                <span className="text-[10px] text-red-400 ml-1 flex items-center gap-1.5 animate-in fade-in">
                  <AlertTriangle size={12} /> {errors.email}
                </span>
              )}
            </div>

            {/* Password Field with visibility toggle */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className={getFieldStyles("password")}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <span className="text-[10px] text-red-400 ml-1 flex items-center gap-1.5 animate-in fade-in">
                  <AlertTriangle size={12} /> {errors.password}
                </span>
              )}
            </div>

            {/* Submit button with loading state */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-8 rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/15 border border-white/5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer alternative action */}
          <footer className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Join TaskFlow
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Login;