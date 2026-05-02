
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Layers, LogOut, Plus, Pencil, Trash2, Check, X,
  CalendarDays, Tag, AlertTriangle, ClipboardList,
  CheckCircle2, Clock, LayoutGrid, Search, Loader2,
  ChevronLeft, ChevronRight, SlidersHorizontal, CheckCheck, Info,
} from "lucide-react";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const CATEGORIES = ["General", "Work", "Personal", "Urgent"];

const CAT_STYLE = {
  General:  "bg-slate-500/15  text-slate-400  border-slate-500/25",
  Work:     "bg-blue-500/15   text-blue-400   border-blue-500/25",
  Personal: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  Urgent:   "bg-rose-500/15   text-rose-400   border-rose-500/25",
};

const ITEMS_PER_PAGE = 5;

const LIMITS = {
  title:      { min: 3,  max: 50  },
  description: { min: 5,  max: 500 },
};

// ─────────────────────────────────────────────
//  Date Helpers
// ─────────────────────────────────────────────
const todayStr  = () => new Date().toISOString().split("T")[0];
const midnight  = (d = new Date()) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const isPast    = (d)       => d && midnight(d) < midnight();
const isOverdue = (d, done) => !done && isPast(d);
const isToday   = (d)       => d && midnight(d).getTime() === midnight().getTime();
const isUpcoming= (d, done) => !done && d && midnight(d) > midnight();
const fmtDate   = (iso)     => iso ? new Date(iso).toLocaleDateString("en-US",{ month:"short",day:"numeric",year:"numeric" }) : null;

// ─────────────────────────────────────────────
//  Validation
// ─────────────────────────────────────────────
function validateField(name, value) {
  const v = String(value || "").trim();
  if (name === "title" || name === "description") {
    const { min, max } = LIMITS[name];
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    if (!v)            return `${label} is required.`;
    if (v.length < min) return `${label} must be at least ${min} characters.`;
    if (v.length > max) return `${label} cannot exceed ${max} characters.`;
  }
  if (name === "dueDate") {
    if (!v)       return "Due date is required.";
    if (isPast(v)) return "Due date cannot be in the past.";
  }
  return "";
}

function validateAll(fields) {
  const errs = {};
  ["title","description","dueDate"].forEach((k) => {
    const e = validateField(k, fields[k]);
    if (e) errs[k] = e;
  });
  return errs;
}

// ─────────────────────────────────────────────
//  Shared styles
// ─────────────────────────────────────────────
const baseField =
  "w-full px-3 py-2.5 rounded-xl bg-[#0d1120] border text-sm text-gray-200 placeholder-gray-600 transition-all focus:outline-none";

const fieldCls = (err) =>
  `${baseField} ${err
    ? "border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
    : "border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"}`;

// ─────────────────────────────────────────────
//  Tiny Sub-components
// ─────────────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-1.5 animate-fadeIn">
      <AlertTriangle size={10} className="flex-shrink-0" />{msg}
    </p>
  ) : null;

const CharCount = ({ value, max }) => {
  const len = String(value||"").length;
  return (
    <span className={`text-[10px] tabular-nums ${len >= max*0.85 ? "text-amber-400" : "text-gray-600"}`}>
      {len}/{max}
    </span>
  );
};

function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div className="flex items-center gap-3 bg-[#111622] border border-white/[0.07] rounded-2xl px-4 py-3.5 min-w-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold tracking-tight leading-none">{value}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Confirm Delete Modal
// ─────────────────────────────────────────────
function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-rose-400" />
        </div>
        <h3 className="font-semibold text-gray-200 mb-1">Delete this task?</h3>
        <p className="text-sm text-gray-500 mb-6 break-words">
          "<span className="text-gray-300">{title}</span>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Toast
// ─────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-5 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:w-80 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-start gap-3 pointer-events-auto px-4 py-3 rounded-2xl border text-sm font-medium shadow-2xl animate-slideUp
          ${t.type==="success" ? "bg-emerald-950/90 border-emerald-500/25 text-emerald-300"
          : t.type==="error"   ? "bg-rose-950/90    border-rose-500/25    text-rose-300"
          :                    "bg-blue-950/90    border-blue-500/25    text-blue-300"}`}>
          {t.type==="success" ? <CheckCheck size={15} className="flex-shrink-0 mt-0.5" />
          : t.type==="error"  ? <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          :                    <Info size={15} className="flex-shrink-0 mt-0.5" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 flex-shrink-0"><X size={13}/></button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "info", ms = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }, []);
  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  return { toasts, push, remove };
}

// ─────────────────────────────────────────────
//  Task Form (reused for Add & Edit)
// ─────────────────────────────────────────────
function TaskForm({ initial, onSubmit, onCancel, submitLabel = "Save", loading }) {
  const blank = { title:"", description:"", dueDate:"", category:"General" };
  const [f, setF]           = useState({ ...blank, ...initial });
  const [errs, setErrs]     = useState({});
  const [touched, setTouched] = useState({});
  const [dirty, setDirty]   = useState(false);

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    if (dirty || touched[k]) setErrs((e) => ({ ...e, [k]: validateField(k, v) }));
  };

  const blur = (k) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrs((e) => ({ ...e, [k]: validateField(k, f[k]) }));
  };

  const submit = (e) => {
    e.preventDefault();
    setDirty(true);
    const e2 = validateAll(f);
    setErrs(e2);
    if (Object.keys(e2).length) return;
    onSubmit({ ...f, title: f.title.trim(), description: f.description.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Title <span className="text-rose-400">*</span>
          </label>
          <CharCount value={f.title} max={LIMITS.title.max} />
        </div>
        <input
          type="text"
          placeholder="What needs to be done?"
          className={fieldCls(errs.title)}
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
          onBlur={() => blur("title")}
          maxLength={LIMITS.title.max}
        />
        <FieldError msg={errs.title} />
      </div>

      {/* Description */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Description <span className="text-rose-400">*</span>
          </label>
          <CharCount value={f.description} max={LIMITS.description.max} />
        </div>
        <textarea
          rows={3}
          placeholder="Add details or notes…"
          className={`${fieldCls(errs.description)} resize-none`}
          value={f.description}
          onChange={(e) => set("description", e.target.value)}
          onBlur={() => blur("description")}
          maxLength={LIMITS.description.max}
        />
        <FieldError msg={errs.description} />
      </div>

      {/* Due Date + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Due Date <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            min={todayStr()}
            className={fieldCls(errs.dueDate)}
            value={f.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            onBlur={() => blur("dueDate")}
          />
          <FieldError msg={errs.dueDate} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
            className={`${baseField} border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10`}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          {loading ? <Loader2 size={15} className="animate-spin"/> : <Check size={15}/>}
          {loading ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-semibold transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
//  Paginator
// ─────────────────────────────────────────────
function Paginator({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i===1 || i===total || (i>=current-1 && i<=current+1)) pages.push(i);
    else if (pages[pages.length-1] !== "…") pages.push("…");
  }
  return (
    <div className="flex justify-center items-center gap-1.5 mt-5 flex-wrap">
      <button onClick={() => onChange(current-1)} disabled={current===1}
        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-[#111622] border border-white/[0.07] text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all select-none">
        <ChevronLeft size={13}/> Prev
      </button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} className="text-gray-600 text-xs px-1 select-none">…</span>
          : <button key={p} onClick={() => onChange(p)}
              className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all select-none ${current===p ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" : "bg-[#111622] border border-white/[0.07] text-gray-500 hover:text-white hover:border-white/20"}`}>
              {p}
            </button>
      )}
      <button onClick={() => onChange(current+1)} disabled={current===total}
        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-[#111622] border border-white/[0.07] text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all select-none">
        Next <ChevronRight size={13}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Dashboard (main)
// ─────────────────────────────────────────────
export default function Dashboard() {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [editId, setEditId]         = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deletePending, setDeletePending] = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userName, setUserName]     = useState("Loading...");

  // Filters & sort
  const [search,    setSearch]    = useState("");
  const [fStatus,   setFStatus]   = useState("all");
  const [fCategory, setFCategory] = useState("all");
  const [fDue,      setFDue]      = useState("all");
  const [sortBy,    setSortBy]    = useState("newest");
  const [page,      setPage]      = useState(1);

  const navigate = useNavigate();
  const { toasts, push, remove } = useToast();
  const token = localStorage.getItem("token");

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  // ── Fetch ────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/tasks", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load tasks.");
      setTasks(data);
    } catch (err) {
      push(err.message || "Server connection failed.", "error");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  // ── Fetch User ───────────────────────────
  const fetchUser = useCallback(async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/profile", { headers });
    if (!res.ok) throw new Error();

    const data = await res.json();


    setUserName(data.name || "User");
  } catch {
    setUserName("User");
  }
}, [headers]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchTasks();
    fetchUser();
  }, [fetchTasks, fetchUser, token, navigate]);

  // ── Add ──────────────────────────────────
  const handleAdd = async (fields) => {
    setAdding(true);
    try {
      const res  = await fetch("http://localhost:5000/api/tasks", { method:"POST", headers, body:JSON.stringify(fields) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add task.");
      push("Task added successfully!", "success");
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      push(err.message, "error");
    } finally {
      setAdding(false);
    }
  };

  // ── Delete ───────────────────────────────
  const handleDelete = async () => {
    const { id, title } = deletePending;
    setDeletePending(null);
    setTasks((p) => p.filter((t) => t._id !== id));
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, { method:"DELETE", headers });
      if (!res.ok) throw new Error();
      push(`"${title}" deleted.`, "info");
    } catch {
      push("Failed to delete task.", "error");
      fetchTasks();
    }
  };

  // ── Complete ─────────────────────────────
  const handleComplete = async (task) => {
    if (task.completed) return;
    setTasks((p) => p.map((t) => t._id===task._id ? {...t, completed:true} : t));
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method:"PUT", headers, body:JSON.stringify({ completed:true }),
      });
      if (!res.ok) throw new Error();
      push("Task marked as complete!", "success");
    } catch {
      push("Failed to update task.", "error");
      fetchTasks();
    }
  };

  // ── Edit save ────────────────────────────
  const handleEditSave = async (fields) => {
    setEditLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${editId}`, {
        method:"PUT", headers, body:JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Could not save changes.");
      push("Task updated!", "success");
      setEditId(null);
      fetchTasks();
    } catch (err) {
      push(err.message, "error");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Stats ────────────────────────────────
  const stats = useMemo(() => ({
    total:    tasks.length,
    active:   tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) =>  t.completed).length,
    overdue:   tasks.filter((t) => isOverdue(t.dueDate, t.completed)).length,
  }), [tasks]);

  // ── Filter + sort ────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = tasks.filter((t) => {
      if (fStatus==="active"    &&  t.completed) return false;
      if (fStatus==="completed" && !t.completed) return false;
      if (fCategory!=="all" && t.category!==fCategory) return false;
      if (fDue==="today"    && !isToday(t.dueDate))              return false;
      if (fDue==="upcoming" && !isUpcoming(t.dueDate,t.completed)) return false;
      if (fDue==="overdue"  && !isOverdue(t.dueDate,t.completed))  return false;
      if (q && !t.title.toLowerCase().includes(q) && !(t.description||"").toLowerCase().includes(q)) return false;
      return true;
    });
    out.sort((a,b) => {
      if (sortBy==="newest") return new Date(b.createdAt||0)-new Date(a.createdAt||0);
      if (sortBy==="oldest") return new Date(a.createdAt||0)-new Date(b.createdAt||0);
      if (sortBy==="dueAsc") { if(!a.dueDate) return 1; if(!b.dueDate) return -1; return new Date(a.dueDate)-new Date(b.dueDate); }
      if (sortBy==="alpha")  return a.title.localeCompare(b.title);
      return 0;
    });
    return out;
  }, [tasks, search, fStatus, fCategory, fDue, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, fStatus, fCategory, fDue, sortBy]);

  const paginated = useMemo(() => {
    const s = (page-1)*ITEMS_PER_PAGE;
    return filtered.slice(s, s+ITEMS_PER_PAGE);
  }, [filtered, page]);

  const activeFilters = [fStatus!=="all", fCategory!=="all", fDue!=="all", sortBy!=="newest"].filter(Boolean).length;

  const clearFilters = () => { setFStatus("all"); setFCategory("all"); setFDue("all"); setSortBy("newest"); };

  // find task for edit
  const editTask = tasks.find((t) => t._id === editId);
  const editInitial = editTask ? {
    title:      editTask.title,
    description: editTask.description||"",
    dueDate:    editTask.dueDate ? editTask.dueDate.split("T")[0] : "",
    category:   editTask.category||"General",
  } : null;

  // ─────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0}                                    to{opacity:1}                         }
        .animate-slideUp { animation: slideUp .2s ease both }
        .animate-fadeIn  { animation: fadeIn  .18s ease both }
      `}</style>

      <div className="min-h-screen bg-[#060912] text-gray-200" style={{ fontFamily:"'Inter',sans-serif" }}>

        {/* ── Navbar ─────────────────────────── */}
        <nav className="sticky top-0 z-40 bg-[#060912]/95 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Layers size={14} className="text-white"/>
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs text-gray-500 hidden lg:block truncate">
                Welcome, <span className="text-blue-400 font-medium">{userName}</span>
              </span>
              <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
                className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0">
                <LogOut size={13}/> <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* ── Page header ──────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
                My Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Stay organized, track everything in one place.</p>
            </div>
            <button onClick={() => { setShowForm((v)=>!v); setShowFilters(false); }}
              className="lg:hidden inline-flex items-center gap-2 self-start bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all">
              <Plus size={15}/> {showForm ? "Close" : "New Task"}
            </button>
          </div>

          {/* ── Stats ────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
            <StatCard icon={ClipboardList} value={stats.total}    label="Total"      accent="bg-blue-600"    />
            <StatCard icon={Clock}         value={stats.active}    label="In Progress"  accent="bg-amber-500"   />
            <StatCard icon={CheckCircle2}  value={stats.completed} label="Completed"    accent="bg-emerald-600" />
            <StatCard icon={AlertTriangle} value={stats.overdue}   label="Overdue"      accent="bg-rose-600"    />
          </div>

          {/* ── Main layout ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-start">

            {/* ── Add Task sidebar ─────────────── */}
            <aside className={`${showForm ? "block" : "hidden"} lg:block lg:sticky lg:top-[4.5rem]`}>
              <div className="bg-[#111622] border border-white/[0.07] rounded-2xl p-5 sm:p-6 shadow-2xl">
                <h2 className="text-sm font-semibold text-gray-300 mb-5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Plus size={13} className="text-blue-400"/>
                  </div>
                  Create New Task
                </h2>
                <TaskForm
                  onSubmit={handleAdd}
                  submitLabel="Add Task"
                  loading={adding}
                  onCancel={showForm ? () => setShowForm(false) : undefined}
                />
              </div>
            </aside>

            {/* ── Task list ────────────────────── */}
            <section className="space-y-4 min-w-0">

              {/* ── Filter bar ───────────────── */}
              <div className="bg-[#111622] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex gap-2 p-3 sm:p-4">
                  <div className="relative flex-1 min-w-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                    <input type="text" placeholder="Search by title or description…" value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#0d1120] border border-white/[0.07] focus:outline-none focus:border-blue-500/50 text-sm text-gray-300 placeholder-gray-600 transition-all"/>
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        <X size={13}/>
                      </button>
                    )}
                  </div>
                  <button onClick={() => setShowFilters((v)=>!v)}
                    className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all
                      ${showFilters || activeFilters > 0
                        ? "bg-blue-600/15 border-blue-500/30 text-blue-400"
                        : "bg-[#0d1120] border-white/[0.07] text-gray-400 hover:text-gray-300"}`}>
                    <SlidersHorizontal size={13}/>
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilters > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                  </button>
                </div>

                {/* Status tabs */}
                <div className="px-3 sm:px-4 pb-3">
                  <div className="flex rounded-xl bg-[#0d1120] border border-white/[0.07] p-1 gap-1">
                    {[
                      { val:"all",      label:`All (${stats.total})`        },
                      { val:"active",    label:`Active (${stats.active})`     },
                      { val:"completed", label:`Done (${stats.completed})`    },
                    ].map(({ val, label }) => (
                      <button key={val} onClick={() => setFStatus(val)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all truncate
                          ${fStatus===val ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collapsible filter options */}
                {showFilters && (
                  <div className="border-t border-white/[0.06] px-3 sm:px-4 pt-3 pb-4 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                      {[
                        { label:"Due Date", value:fDue, set:setFDue,
                          opts:[["all","Any Date"],["today","Due Today"],["upcoming","Upcoming"],["overdue","Overdue"]] },
                        { label:"Category", value:fCategory, set:setFCategory,
                          opts:[["all","All Categories"],...CATEGORIES.map((c)=>[c,c])] },
                        { label:"Sort By",  value:sortBy,    set:setSortBy,
                          opts:[["newest","Newest"],["oldest","Oldest"],["dueAsc","Earliest Due"],["alpha","A → Z"]] },
                      ].map(({ label, value, set, opts }) => (
                        <div key={label}>
                          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">{label}</label>
                          <select value={value} onChange={(e) => set(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#0d1120] border border-white/[0.07] text-xs text-gray-400 focus:outline-none focus:border-blue-500/40">
                            {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    {activeFilters > 0 && (
                      <button onClick={clearFilters}
                        className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-all">
                        <X size={11}/> Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── Loading skeletons ─────────── */}
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-[100px] rounded-2xl bg-[#111622] border border-white/[0.07] animate-pulse"/>
                  ))}
                </div>

              /* ── Empty state ─────────────── */
              ) : paginated.length === 0 ? (
                <div className="bg-[#111622] border border-white/[0.07] rounded-2xl py-16 sm:py-20 text-center">
                  <LayoutGrid size={32} className="mx-auto text-gray-700 mb-3"/>
                  <p className="text-gray-500 text-sm font-medium">
                    {tasks.length === 0 ? "No tasks yet — create one to get started!" : "No tasks match your filters."}
                  </p>
                  {tasks.length > 0 && (
                    <button onClick={() => { clearFilters(); setSearch(""); }}
                      className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-all">
                      Clear all filters
                    </button>
                  )}
                </div>

              /* ── Task cards ──────────────── */
              ) : (
                <div className="space-y-3">
                  {paginated.map((task) => {
                    const overdue  = isOverdue(task.dueDate, task.completed);
                    const dueToday = isToday(task.dueDate);

                    // Inline edit
                    if (editId === task._id) {
                      return (
                        <div key={task._id} className="bg-[#111622] border border-blue-500/25 rounded-2xl p-4 sm:p-5 shadow-xl animate-fadeIn">
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Editing Task</p>
                          <TaskForm
                            initial={editInitial}
                            onSubmit={handleEditSave}
                            onCancel={() => setEditId(null)}
                            submitLabel="Save Changes"
                            loading={editLoading}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={task._id}
                        className={`group relative bg-[#111622] border rounded-2xl p-4 sm:p-5 transition-all hover:border-white/10
                          ${task.completed ? "opacity-60 border-emerald-500/10" : "border-white/[0.07] hover:shadow-2xl"}`}>

                        {/* Header row with category & actions */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider ${CAT_STYLE[task.category] || CAT_STYLE.General}`}>
                              {task.category || "General"}
                            </span>
                            {task.completed ? (
                              <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 size={10}/> Done
                              </span>
                            ) : overdue ? (
                              <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                                <AlertTriangle size={10}/> Overdue
                              </span>
                            ) : dueToday ? (
                              <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <Clock size={10}/> Due Today
                              </span>
                            ) : task.dueDate ? (
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <CalendarDays size={12}/> {fmtDate(task.dueDate)}
                              </span>
                            ) : null}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                            {!task.completed && (
                              <button onClick={() => handleComplete(task)} title="Mark as completed"
                                className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-all">
                                <Check size={13}/>
                              </button>
                            )}
                            <button onClick={() => setEditId(task._id)} title="Edit Task"
                              className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 flex items-center justify-center transition-all">
                                <Pencil size={12}/>
                            </button>
                            <button onClick={() => setDeletePending({ id: task._id, title: task.title })} title="Delete Task"
                              className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center transition-all">
                              <Trash2 size={12}/>
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className={`text-sm sm:text-base font-semibold text-gray-200 mb-1.5 break-words ${task.completed ? "line-through opacity-70" : ""}`}>
                            {task.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 break-words leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Date / status banner inside card */}
                        <div className="flex items-center justify-between border-t border-white/[0.03] mt-4 pt-3.5">
                          <span className="text-[10px] text-gray-600 font-mono">
                            Created: {fmtDate(task.createdAt)}
                          </span>
                          {task.completed ? (
                            <span className="text-emerald-500 text-xs font-medium">&#10003; Completed</span>
                          ) : null}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              <Paginator current={page} total={totalPages} onChange={setPage} />

            </section>
          </div>

          {/* Delete Confirmation Modal */}
          {deletePending && (
            <ConfirmModal
              title={deletePending.title}
              onConfirm={handleDelete}
              onCancel={() => setDeletePending(null)}
            />
          )}

          {/* Toasts */}
          <Toast toasts={toasts} remove={remove} />

        </main>
      </div>
    </>
  );
}