import { useState, useMemo, useEffect } from "react";
import { useAppData } from "../api/useAppData";

const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с";
const today = () => new Date().toISOString().slice(0, 10);
const timeToMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const visitDuration = (a) => (a.items || []).reduce((s, i) => s + (Number(i.duration) || 0), 0);
const visitTotal    = (a) => (a.items || []).reduce((s, i) => s + (Number(i.price)    || 0), 0);

const ROLES = {
  cosmetologist: "Косметолог",
  permanent:     "Мастер перманента",
  admin:         "Администратор",
  cleaner:       "Технический персонал",
  other:         "Другое",
};

const STATUS_EVENT = {
  pending: "bg-amber-400", confirmed: "bg-blue-500", arrived: "bg-purple-500",
  completed: "bg-green-500", no_show: "bg-zinc-300", cancelled: "bg-red-400",
};

function initials(name) {
  return (name || "").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const IconX       = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheck   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconSearch  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconChevron = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>

function StaffFormModal({ staff, onSave, onClose }) {
  const isEdit = !!staff;
  const [form, setForm] = useState({
    name:      staff?.name      || "",
    role:      staff?.role      || "cosmetologist",
    active:    staff?.active    ?? true,
    specialty: staff?.specialty || "",
    phone:     staff?.phone     || "",
    email:     staff?.email     || "",
    schedule:  staff?.schedule  || "",
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = "w-full h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const sel = "w-full h-10 px-3 pr-8 text-[13px] border border-zinc-200 rounded-lg bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer";
  const lbl = "block text-[13px] font-medium text-zinc-700 mb-1.5";

  const handleSave = async () => {
    if (!form.name.trim()) { setErr("Введите ФИО"); return; }
    setBusy(true); setErr(null);
    try {
      await onSave({ name: form.name.trim(), role: form.role, active: form.active, specialty: form.specialty.trim(), phone: form.phone.trim(), email: form.email.trim(), schedule: form.schedule.trim() });
      onClose();
    } catch(e) { setErr(e.message || "Ошибка сохранения"); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 rounded-t-2xl">
          <div className="text-[16px] font-bold text-zinc-900">{isEdit ? "Редактировать сотрудника" : "Новый сотрудник"}</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div><label className={lbl}>ФИО *</label><input placeholder="Например: Айгерим Султанова" value={form.name} onChange={set("name")} className={inp} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Должность</label>
              <select value={form.role} onChange={set("role")} className={sel}>
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Статус</label>
              <select value={String(form.active)} onChange={e => setForm(f => ({ ...f, active: e.target.value === "true" }))} className={sel}>
                <option value="true">Работает</option>
                <option value="false">Не работает</option>
              </select>
            </div>
          </div>
          <div><label className={lbl}>Специализация</label><input placeholder="Например: ботокс, филлеры" value={form.specialty} onChange={set("specialty")} className={inp} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Телефон</label><input type="tel" placeholder="+996 700 000 000" value={form.phone} onChange={set("phone")} className={inp} /></div>
            <div><label className={lbl}>Email</label><input type="email" value={form.email} onChange={set("email")} className={inp} /></div>
          </div>
          <div><label className={lbl}>График работы</label><input placeholder="Пн–Пт, 09:00–18:00" value={form.schedule} onChange={set("schedule")} className={inp} /></div>
          {err && <div className="text-[12px] text-red-500">{err}</div>}
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 rounded-b-2xl flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[14px] font-medium rounded-lg transition-colors">Отмена</button>
          <button onClick={handleSave} disabled={busy} className="flex-1 h-10 inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400 text-white text-[14px] font-semibold rounded-lg transition-colors">
            <IconCheck /><span>{busy ? "Сохранение…" : "Сохранить"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

  function DailySummary({ appointments, staff, rooms }) {
  const todayStr = today();
  const appts    = appointments.filter(a => a.date === todayStr);
  const byStatus = appts.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});
  const expected   = appts.reduce((s, a) => s + visitTotal(a), 0);
  const usedRooms  = new Set(appts.map(a => a.roomId).filter(Boolean)).size;
  const usedStaff  = new Set(appts.flatMap(a => (a.items || []).map(i => i.staffId).filter(Boolean))).size;
  const activePerf = (staff || []).filter(s => s.active !== false && (s.role === "cosmetologist" || s.role === "permanent")).length;
  const pending    = byStatus.pending || 0;

  return (
    <div className="flex flex-wrap gap-0 bg-white border border-zinc-200 rounded-lg overflow-hidden">
      {[
        { label: "Записей сегодня",  value: appts.length,              extra: pending > 0 ? <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">{pending} ожид.</span> : null },
        { label: "Занято кабинетов", value: `${usedRooms}/${(rooms || []).filter(r => r.active !== false).length}` },
        { label: "Работают мастера", value: `${usedStaff}/${activePerf}` },
        { label: "Ожидается",        value: fmtMoney(expected) },
      ].map((b, i, arr) => (
        <div key={i} className={`flex flex-col justify-center px-5 py-3.5 flex-1 min-w-40 ${i < arr.length - 1 ? "border-r border-zinc-200" : ""}`}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1.5">{b.label}</div>
          <div className="flex items-center">
            <div className="text-[20px] font-bold text-zinc-900 leading-none">{b.value}</div>
            {b.extra}
          </div>
        </div>
      ))}
    </div>
  );
}

function PerformerCard({ staff: s, appointments, onClick }) {
  const todayStr = today();
  const nowMin   = (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })();

  const visits = appointments
    .filter(a => a.date === todayStr && (a.items || []).some(i => i.staffId === s.id))
    .sort((a, b) => a.time.localeCompare(b.time));

  let count = 0, mins = 0, money = 0, currentVisit = null;
  visits.forEach(a => {
    const myItems = (a.items || []).filter(i => i.staffId === s.id);
    count += myItems.length;
    myItems.forEach(i => { mins += Number(i.duration) || 0; money += Number(i.price) || 0; });
    const start = timeToMinutes(a.time), end = start + (visitDuration(a) || 30);
    if (start <= nowMin && nowMin < end) currentVisit = a;
  });

  const isWorking  = s.active !== false;
  const hasCurrent = !!currentVisit;
  const hasVisits  = visits.length > 0;

  const badgeText = !isWorking ? "Выходной" : hasCurrent ? "Сейчас работает" : hasVisits ? "На смене" : "Нет записей";
  const badgeCls = !isWorking ? "bg-red-100 text-red-700" : hasCurrent ? "bg-blue-100 text-blue-700" : hasVisits ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500";

  const leftBorderCls = !isWorking ? "border-l-red-400" : hasCurrent ? "border-l-blue-500" : hasVisits ? "border-l-green-500" : "border-l-zinc-300";

  return (
    <div onClick={onClick} className={`staff-card bg-white border border-zinc-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${leftBorderCls}`}>
      {/* header */}
      <div className="staff-head px-4 pt-4 pb-3">
        <div className="flex items-start gap-3 mb-2">
          <div className="user-avatar w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[14px] font-bold shrink-0">{initials(s.name)}</div>
          <div className="staff-head-main flex-1 min-w-0">
            <div className="staff-name text-[15px] font-bold text-zinc-900 leading-tight mb-0.5">{s.name}</div>
            <div className="staff-role text-[12px] text-zinc-600">
              {ROLES[s.role] || s.role}
              {s.specialty && <span> · {s.specialty}</span>}
            </div>
          </div>
          <span className={`badge px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 ${badgeCls}`}>{badgeText}</span>
        </div>
      </div>

      {/* stats */}
      <div className="staff-stats grid grid-cols-3 gap-0 bg-zinc-50 mx-4 rounded-lg overflow-hidden mb-3">
        <div className="stat text-center px-3 py-3">
          <div className="stat-value text-[20px] font-bold text-zinc-900 leading-none mb-1">{count}</div>
          <div className="stat-label text-[10px] uppercase tracking-wider text-zinc-500 font-medium">записей</div>
        </div>
        <div className="stat text-center px-3 py-3">
          <div className="stat-value text-[20px] font-bold text-zinc-900 leading-none mb-1">
            {Math.round((mins / 60) * 10) / 10}<span className="stat-unit text-[11px] font-normal text-zinc-500"> ч</span>
          </div>
          <div className="stat-label text-[10px] uppercase tracking-wider text-zinc-500 font-medium">занято</div>
        </div>
        <div className="stat text-center px-3 py-3">
          <div className="stat-value text-[16px] font-bold text-zinc-900 leading-none mb-1">{fmtMoney(money)}</div>
          <div className="stat-label text-[10px] uppercase tracking-wider text-zinc-500 font-medium">ожидается</div>
        </div>
      </div>

      {/* visits */}
      <div className="staff-chips px-4 py-3" onClick={e => e.stopPropagation()}>
        {visits.length === 0
          ? <div className="text-[12px] text-zinc-400 py-1">Записей на сегодня нет</div>
          : <div className="flex flex-wrap gap-1.5">
              {visits.slice(0, 4).map(a => {
                const start = timeToMinutes(a.time), end = start + (visitDuration(a) || 30);
                const isCur = start <= nowMin && nowMin < end;
                return (
                  <div key={a.id} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium ${isCur ? "bg-blue-500 text-white" : "bg-zinc-100 text-zinc-700"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCur ? "bg-white" : STATUS_EVENT[a.status] || "bg-zinc-400"}`}/>
                    <span>{a.time}</span>
                  </div>
                );
              })}
              {visits.length > 4 && <div className="inline-flex items-center px-2 py-1 text-[11px] text-zinc-500">+{visits.length - 4}</div>}
            </div>
        }
      </div>
    </div>
  );
}

function OtherStaffCard({ s, onClick }) {
  return (
    <div onClick={onClick} className="staff-card bg-white border border-zinc-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="staff-head px-4 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="user-avatar w-10 h-10 rounded-full bg-zinc-500 text-white flex items-center justify-center text-[14px] font-bold shrink-0">{initials(s.name)}</div>
          <div className="staff-head-main flex-1 min-w-0">
            <div className="staff-name text-[15px] font-bold text-zinc-900 leading-tight mb-0.5">{s.name}</div>
            <div className="staff-role text-[12px] text-zinc-600">{ROLES[s.role] || s.role}</div>
          </div>
          {s.active === false && <span className="badge px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[11px] font-semibold">Не работает</span>}
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        {s.specialty && <div className="text-[13px] text-zinc-700 font-medium">{s.specialty}</div>}
        <div className="space-y-1 text-[12px] text-zinc-500">
          {s.phone && <div>{s.phone}</div>}
          {s.schedule && <div>{s.schedule}</div>}
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const { data, loading, error, api } = useAppData();
  const { staff = [], appointments = [] } = data;

  const [filter,    setFilter]    = useState({ search: "", role: "all" });
  const [editStaff, setEditStaff] = useState(null);

  useEffect(() => {
    const handler = () => setEditStaff("new");
    window.addEventListener("open-new-staff", handler);
    return () => window.removeEventListener("open-new-staff", handler);
  }, []);

  const filtered = useMemo(() => {
    let list = [...staff];
    if (filter.role !== "all") list = list.filter(s => s.role === filter.role);
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || (s.specialty || "").toLowerCase().includes(q) || (s.phone || "").includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [staff, filter]);

  const performers = filtered.filter(s => s.role === "cosmetologist" || s.role === "permanent");
  const others     = filtered.filter(s => !["cosmetologist", "permanent"].includes(s.role));

  const handleSave = async (formData) => {
    if (editStaff && editStaff !== "new") {
      await api.updateStaff(editStaff.id, formData);
    } else {
      await api.createStaff(formData);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>;
  if (error)   return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="flex flex-col gap-4">
      {editStaff && (
        <StaffFormModal
          staff={editStaff !== "new" ? editStaff : null}
          onSave={handleSave}
          onClose={() => setEditStaff(null)}
        />
      )}
<DailySummary appointments={appointments} staff={staff} rooms={data.rooms} />

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-blue-50/40 border-b border-zinc-200">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-45 max-w-70">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"><IconSearch /></span>
              <input type="text" placeholder="Поиск по имени или специализации"
                value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                className="w-full h-8 pl-8 pr-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="relative">
              <select value={filter.role} onChange={e => setFilter(f => ({ ...f, role: e.target.value }))}
                className="h-8 px-2.5 pr-7 text-[13px] border border-zinc-200 rounded-md bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
                <option value="all">Все должности</option>
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"><IconChevron /></span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {performers.length > 0 && (
            <div>
              <div className="text-[13px] font-semibold text-zinc-700 mb-3">
                Исполнители <span className="font-normal text-zinc-400">· загрузка на сегодня</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {performers.map(s => (
                  <PerformerCard key={s.id} staff={s} appointments={appointments} onClick={() => setEditStaff(s)} />
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              <div className="text-[13px] font-semibold text-zinc-700 mb-3">Прочий персонал</div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {others.map(s => (
                  <OtherStaffCard key={s.id} s={s} onClick={() => setEditStaff(s)} />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-14 text-center text-zinc-400 text-[13px]">Сотрудников не найдено</div>
          )}
        </div>
      </div>
    </div>
  );
}