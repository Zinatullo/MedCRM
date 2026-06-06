import { useState, useMemo, useRef, useEffect } from "react";
import { useAppData } from "../api/useAppData";

// ── helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0, 10); };
const startOfWeek = (d) => { const dt = new Date(d); const day = dt.getDay(); dt.setDate(dt.getDate() + (day === 0 ? -6 : 1 - day)); return dt.toISOString().slice(0, 10); };
const normName = (s) => (s || "").trim().toLowerCase().replace(/ё/g, "е");

const DAY_NAMES      = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
const DAY_NAMES_FULL = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const MONTH_NAMES    = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с";
const timeToMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

const STATUS_EVENT = {
  pending:   { bar: "bg-amber-400",  bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700"  },
  confirmed: { bar: "bg-blue-500",   bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700"   },
  arrived:   { bar: "bg-purple-500", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  completed: { bar: "bg-green-500",  bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700"  },
  no_show:   { bar: "bg-zinc-300",   bg: "bg-zinc-100",  border: "border-zinc-200",   text: "text-zinc-400"   },
  cancelled: { bar: "bg-red-400",    bg: "bg-red-50",    border: "border-red-200",    text: "text-red-500"    },
};
const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-800", confirmed: "bg-blue-100 text-blue-800",
  arrived: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800",
  no_show: "bg-zinc-100 text-zinc-500", cancelled: "bg-red-100 text-red-700",
};
const STATUS_LABEL = {
  pending: "Не подтверждена", confirmed: "Подтверждена", arrived: "Клиент пришёл",
  completed: "Завершена", no_show: "Не пришёл", cancelled: "Отменена",
};

const SLOTS = [];
for (let h = 9; h <= 20; h++) {
  SLOTS.push({ time: `${String(h).padStart(2,"0")}:00`, isHour: true });
  SLOTS.push({ time: `${String(h).padStart(2,"0")}:30`, isHour: false });
}
const DAY_START = 9 * 60;
const SLOT_H    = 40;

const visitItems     = (a) => a.items || [];
const visitDuration  = (a) => visitItems(a).reduce((s, i) => s + (Number(i.duration) || 0), 0);
const visitTotal     = (a) => visitItems(a).reduce((s, i) => s + (Number(i.price) || 0), 0);
const visitDiscount  = (a) => Math.max(0, Number(a.discount) || 0);
const visitDue       = (a) => Math.max(0, visitTotal(a) - visitDiscount(a));
const visitPaid      = (a) => Math.max(0, Number(a.paidCash) || 0) + Math.max(0, Number(a.paidCard) || 0);
const visitRemaining = (a) => Math.max(0, visitDue(a) - visitPaid(a));

const isValidPhone = (p) => (p || "").replace(/\D/g, "").length >= 10;

const ChevL    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevR    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconX    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCheck= () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPlus = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconAlertCircle = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-red-600">
      <IconAlertCircle /><span>{msg}</span>
    </div>
  );
}

// ── QuickBookModal ────────────────────────────────────────────────────────────

function QuickBookModal({ date, time, clients, services, staff, rooms, onSave, onClose, api }) {
  const fmtModalDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const performers = staff.filter(s => s.active !== false && (s.role === "cosmetologist" || s.role === "permanent"));
  const todayStr = today();

  const [lookup, setLookup] = useState({ lastName: "", firstName: "", birthDate: "", phone: "", email: "", tag: "new" });
  const [lookupErrors, setLookupErrors] = useState({});
  const [foundClient, setFoundClient]   = useState(null);
  const [notFound, setNotFound]         = useState(false);
  const [searchErrors, setSearchErrors] = useState({});

  const [form, setForm] = useState({
    date, time, staffId: "", serviceId: "", roomId: "", status: "pending",
    discount: "", paidCash: "", paidCard: "", notes: "",
  });
  const [items, setItems]           = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [saveAttempted, setSaveAttempted] = useState(false);

  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, []);

  const setF = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (saveAttempted) setFormErrors(p => ({ ...p, [k]: null }));
  };

  // числовые поля — храним как строку, парсим при вычислениях
  const setMoney = (k) => (e) => {
    const val = e.target.value;
    // разрешаем пустую строку и числа
    if (val === "" || /^\d+$/.test(val)) setForm(f => ({ ...f, [k]: val }));
  };

  const handleLookup = () => {
    const errs = {};
    if (!lookup.lastName.trim())  errs.lastName  = "Введите фамилию";
    if (!lookup.firstName.trim()) errs.firstName = "Введите имя";
    if (!lookup.birthDate)        errs.birthDate = "Укажите дату рождения";
    setSearchErrors(errs);
    if (Object.keys(errs).length) return;
    const ln = normName(lookup.lastName), fn = normName(lookup.firstName), bd = lookup.birthDate;
    const found = clients.find(c => normName(c.lastName) === ln && normName(c.firstName) === fn && c.birthDate === bd);
    if (found) { setFoundClient(found); setNotFound(false); setSearchErrors({}); }
    else       { setNotFound(true); setFoundClient(null); }
  };

  const handleCreateClient = async () => {
    const errs = {};
    if (!lookup.firstName.trim()) errs.firstName = "Введите имя";
    if (!lookup.lastName.trim())  errs.lastName  = "Введите фамилию";
    if (!lookup.birthDate)        errs.birthDate = "Укажите дату рождения";
    if (!lookup.phone?.trim())    errs.phone     = "Введите телефон";
    else if (!isValidPhone(lookup.phone)) errs.phone = "Минимум 10 цифр";
    setLookupErrors(errs);
    if (Object.keys(errs).length) return;
    const newClient = await api.createClient({
      firstName: lookup.firstName.trim(), lastName: lookup.lastName.trim(),
      birthDate: lookup.birthDate, phone: lookup.phone.trim(),
      email: lookup.email?.trim() || "", tag: lookup.tag || "new",
    });
    if (newClient) { setFoundClient(newClient); setNotFound(false); setLookupErrors({}); }
  };

  const handleAddService = () => {
    if (!form.staffId || !form.serviceId) return;
    const svc = services.find(s => s.id === form.serviceId);
    if (!svc) return;
    setItems(prev => [...prev, { id: Math.random().toString(36).slice(2), serviceId: svc.id, staffId: form.staffId, price: svc.price, duration: svc.duration }]);
    setForm(f => ({ ...f, serviceId: "" }));
    if (saveAttempted) setFormErrors(p => ({ ...p, items: null }));
  };

  // финансы — всегда актуальны
  const total     = items.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const disc      = Math.max(0, Number(form.discount) || 0);
  const due       = Math.max(0, total - disc);
  const paid      = Math.max(0, Number(form.paidCash) || 0) + Math.max(0, Number(form.paidCard) || 0);
  const remaining = Math.max(0, due - paid);

  const handleSave = () => {
    setSaveAttempted(true);
    const errs = {};
    if (!foundClient)              errs.client = "Найдите или создайте клиента";
    if (!form.date)                errs.date   = "Укажите дату";
    else if (form.date < todayStr) errs.date   = "Нельзя записать на прошедшую дату";
    if (!form.time)                errs.time   = "Укажите время";
    if (!items.length)             errs.items  = "Добавьте хотя бы одну услугу";
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    onSave?.({
      clientId: foundClient.id, date: form.date, time: form.time,
      roomId: form.roomId || null, items, status: form.status,
      discount: Number(form.discount) || 0,
      paidCash: Number(form.paidCash) || 0,
      paidCard: Number(form.paidCard) || 0,
      notes: form.notes,
    });
    onClose();
  };

  const clientName = foundClient
    ? `${foundClient.firstName || ""} ${foundClient.lastName || ""}`.trim() || foundClient.name
    : null;

  const inp = (hasErr) => `w-full h-10 px-3 text-[13px] border rounded-lg bg-white focus:outline-none transition-colors ${hasErr ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-zinc-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"}`;
  const sel = (hasErr) => `w-full h-10 px-3 pr-8 text-[13px] border rounded-lg bg-white appearance-none focus:outline-none transition-colors cursor-pointer ${hasErr ? "border-red-400" : "border-zinc-200 focus:border-blue-400"}`;
  const lbl = "block text-[13px] font-medium text-zinc-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div ref={scrollRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 rounded-t-2xl shrink-0">
          <div className="text-[15px] font-bold text-zinc-900">Быстрая запись · {fmtModalDate(date)} в {time}</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* КЛИЕНТ */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Клиент</div>
            {saveAttempted && formErrors.client && !foundClient && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <IconAlertCircle /><span className="text-[12.5px] text-red-700 font-medium">{formErrors.client}</span>
              </div>
            )}
            {foundClient ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <div className="text-[13px] font-semibold text-zinc-900">{clientName}</div>
                  {foundClient.phone && <div className="text-[12px] text-zinc-500 mt-0.5">{foundClient.phone}</div>}
                </div>
                <button onClick={() => { setFoundClient(null); setNotFound(false); }} className="text-[11px] text-zinc-400 hover:text-zinc-700 underline">сменить</button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-zinc-700">Найти клиента *</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input placeholder="Фамилия" value={lookup.lastName}
                      onChange={e => { setLookup(l => ({ ...l, lastName: e.target.value })); setSearchErrors(p => ({ ...p, lastName: null })); }}
                      onKeyDown={e => e.key === "Enter" && handleLookup()}
                      className={inp(!!searchErrors.lastName)} />
                    <FieldError msg={searchErrors.lastName} />
                  </div>
                  <div className="flex-1">
                    <input placeholder="Имя" value={lookup.firstName}
                      onChange={e => { setLookup(l => ({ ...l, firstName: e.target.value })); setSearchErrors(p => ({ ...p, firstName: null })); }}
                      onKeyDown={e => e.key === "Enter" && handleLookup()}
                      className={inp(!!searchErrors.firstName)} />
                    <FieldError msg={searchErrors.firstName} />
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input type="date" value={lookup.birthDate}
                      onChange={e => { setLookup(l => ({ ...l, birthDate: e.target.value })); setSearchErrors(p => ({ ...p, birthDate: null })); }}
                      onKeyDown={e => e.key === "Enter" && handleLookup()}
                      className={inp(!!searchErrors.birthDate)} />
                    <FieldError msg={searchErrors.birthDate} />
                  </div>
                  <button onClick={handleLookup} className="h-10 px-4 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-semibold rounded-lg transition-colors shrink-0">Найти</button>
                </div>

                {notFound && (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-[13px] font-semibold text-amber-800 mb-0.5">Клиент не найден</div>
                      <div className="text-[12px] text-amber-700">Заполните данные ниже, чтобы создать нового клиента</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[12px] text-zinc-500 mb-1">Фамилия *</label>
                        <input value={lookup.lastName} onChange={e => { setLookup(l => ({ ...l, lastName: e.target.value })); setLookupErrors(p => ({ ...p, lastName: null })); }} className={inp(!!lookupErrors.lastName)} />
                        <FieldError msg={lookupErrors.lastName} />
                      </div>
                      <div>
                        <label className="block text-[12px] text-zinc-500 mb-1">Имя *</label>
                        <input value={lookup.firstName} onChange={e => { setLookup(l => ({ ...l, firstName: e.target.value })); setLookupErrors(p => ({ ...p, firstName: null })); }} className={inp(!!lookupErrors.firstName)} />
                        <FieldError msg={lookupErrors.firstName} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[12px] text-zinc-500 mb-1">Дата рождения *</label>
                        <input type="date" value={lookup.birthDate} onChange={e => { setLookup(l => ({ ...l, birthDate: e.target.value })); setLookupErrors(p => ({ ...p, birthDate: null })); }} className={inp(!!lookupErrors.birthDate)} />
                        <FieldError msg={lookupErrors.birthDate} />
                      </div>
                      <div>
                        <label className="block text-[12px] text-zinc-500 mb-1">Телефон *</label>
                        <input type="tel" placeholder="+996 700 000 000" value={lookup.phone || ""} onChange={e => { setLookup(l => ({ ...l, phone: e.target.value })); setLookupErrors(p => ({ ...p, phone: null })); }} className={inp(!!lookupErrors.phone)} />
                        <FieldError msg={lookupErrors.phone} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[12px] text-zinc-500 mb-1">Email</label>
                        <input type="email" placeholder="example@mail.com" value={lookup.email || ""} onChange={e => setLookup(l => ({ ...l, email: e.target.value }))} className={inp(false)} />
                      </div>
                      <div>
                        <label className="block text-[12px] text-zinc-500 mb-1">Тип клиента</label>
                        <select value={lookup.tag || "new"} onChange={e => setLookup(l => ({ ...l, tag: e.target.value }))} className={sel(false)}>
                          <option value="new">Новый</option>
                          <option value="regular">Постоянный</option>
                          <option value="vip">VIP</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={handleCreateClient} className="w-full h-9 inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-lg transition-colors">
                      <IconPlus />Создать клиента и продолжить
                    </button>
                    <button onClick={() => { setNotFound(false); setSearchErrors({}); }} className="w-full text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors">Попробовать снова</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ВРЕМЯ ВИЗИТА */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Время визита</div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={lbl}>Дата *</label>
                <input
                  type="date"
                  value={form.date}
                  min={todayStr}
                  onChange={e => {
                    if (e.target.value < todayStr) return;
                    setF("date")(e);
                  }}
                  className={inp(!!formErrors.date)}
                />
                <FieldError msg={formErrors.date} />
              </div>
              <div className="w-32">
                <label className={lbl}>Время *</label>
                <input type="time" value={form.time} onChange={setF("time")} className={inp(!!formErrors.time)} />
                <FieldError msg={formErrors.time} />
              </div>
            </div>
          </div>

          {/* УСЛУГИ */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Услуги</div>
            {saveAttempted && formErrors.items && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <IconAlertCircle /><span className="text-[12.5px] text-red-700 font-medium">{formErrors.items}</span>
              </div>
            )}
            {items.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <label className={lbl}>Услуги визита</label>
                {items.map((item, i) => {
                  const svc    = services.find(s => s.id === item.serviceId);
                  const staffM = staff.find(s => s.id === item.staffId);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[12.5px]">
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 truncate">{svc?.name || "—"}</div>
                        <div className="text-zinc-400 text-[11px]">{staffM?.name.split(" ")[0]} · {item.duration} мин</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-zinc-900">{fmtMoney(item.price)}</span>
                        <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))} className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="space-y-2">
              <label className={lbl}>Добавить услугу</label>
              <select value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value, serviceId: "" }))} className={sel(false)}>
                <option value="">— Выберите исполнителя —</option>
                {performers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
{form.staffId && (
  <div className="flex gap-2">
    <select
      value={form.serviceId}
      onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}
      className={`flex-1 ${sel(false)}`}
    >
      <option value="">— Выберите услугу —</option>
      {services.map(s => <option key={s.id} value={s.id}>{s.name} · {fmtMoney(s.price)}</option>)}
    </select>
    <button
    type="button"
      onClick={() => {
          console.log("serviceId:", form.serviceId);
  console.log("staffId:", form.staffId);
        const svc = services.find(s => String(s.id) === String(form.serviceId));
        console.log(svc);
        
        if (!svc) return;
        setItems(prev => [...prev, { id: Math.random().toString(36).slice(2), serviceId: svc.id, staffId: form.staffId, price: svc.price, duration: svc.duration }]);
        setForm(f => ({ ...f, serviceId: "" }));
        setFormErrors(p => ({ ...p, items: null }));
      }}
      disabled={!form.serviceId}
      className="h-10 px-3 inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg transition-colors shrink-0"
    >
      <IconPlus /><span>Добавить</span>

    </button>
  </div>
)}
            </div>
          </div>

          {/* СТАТУС */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Статус и кабинет</div>
            <div className="space-y-3">
              <div>
                <label className={lbl}>Статус</label>
                <select value={form.status} onChange={setF("status")} className={sel(false)}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Кабинет</label>
                <select value={form.roomId} onChange={setF("roomId")} className={sel(false)}>
                  <option value="">— Не выбран —</option>
                  {(rooms || []).filter(r => r.active !== false).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ДЕНЬГИ */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Деньги</div>
            <div className="space-y-3">
              <div>
                <label className={lbl}>Скидка (с)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.discount}
                  onChange={setMoney("discount")}
                  className={inp(false)}
                />
              </div>
              <div>
                <label className={lbl}>Оплачено наличными (с)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.paidCash}
                  onChange={setMoney("paidCash")}
                  className={inp(false)}
                />
              </div>
              <div>
                <label className={lbl}>Оплачено безналом (с)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.paidCard}
                  onChange={setMoney("paidCard")}
                  className={inp(false)}
                />
              </div>

              {/* итоги — пересчитываются автоматически */}
              <div className="pt-2 space-y-1.5 text-[13px] border-t border-zinc-100">
                <div className="flex justify-between text-zinc-500">
                  <span>Сумма услуг:</span>
                  <span className="font-medium text-zinc-900">{fmtMoney(total)}</span>
                </div>
                {disc > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Скидка:</span>
                    <span className="text-red-500 font-medium">−{fmtMoney(disc)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-700 font-semibold">
                  <span>К оплате:</span>
                  <span>{fmtMoney(due)}</span>
                </div>
                {paid > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Оплачено:</span>
                    <span className="text-zinc-700">{fmtMoney(paid)}</span>
                  </div>
                )}
                <div className={`flex justify-between font-bold text-[14px] pt-1.5 border-t border-zinc-200 ${remaining > 0 ? "text-red-600" : "text-green-600"}`}>
                  <span>Остаток:</span>
                  <span>{fmtMoney(remaining)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ЗАМЕТКА */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Заметка</div>
            <textarea value={form.notes} onChange={setF("notes")} rows={3}
              placeholder="Например: пожелания клиента, аллергии"
              className="w-full px-3 py-2.5 text-[13px] border border-zinc-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-zinc-100 rounded-b-2xl shrink-0 space-y-2">
          {saveAttempted && Object.keys(formErrors).length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-700">
              <IconAlertCircle />
              <div>
                <div className="font-semibold mb-0.5">Заполните обязательные поля:</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {formErrors.client && <li>{formErrors.client}</li>}
                  {formErrors.date   && <li>{formErrors.date}</li>}
                  {formErrors.time   && <li>{formErrors.time}</li>}
                  {formErrors.items  && <li>{formErrors.items}</li>}
                </ul>
              </div>
            </div>
          )}
          <button onClick={handleSave}
            className="w-full h-11 inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-[14px] font-semibold rounded-lg transition-colors">
            <IconCheck /><span>Сохранить</span>
          </button>
          <button onClick={onClose} className="w-full h-9 text-zinc-500 hover:text-zinc-800 text-[13px] font-medium transition-colors">Отмена</button>
        </div>
      </div>
    </div>
  );
}

// ── DailySummary ──────────────────────────────────────────────────────────────

function DailySummary({ appointments, rooms, staff }) {
  const todayStr = today();
  const appts = appointments.filter((a) => a.date === todayStr);
  const byStatus = appts.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});
  const expected = appts.reduce((s, a) => s + visitTotal(a), 0);
  const usedRooms = new Set(appts.map((a) => a.roomId).filter(Boolean)).size;
  const usedStaff = new Set(appts.flatMap((a) => visitItems(a).map((i) => i.staffId).filter(Boolean))).size;
  const activeRooms = (rooms || []).filter((r) => r.active !== false).length;
  const activePerformers = (staff || []).filter((s) => s.active !== false && (s.role === "cosmetologist" || s.role === "permanent")).length;
  const blocks = [
    { label: "Записей сегодня", value: appts.length, sub: [byStatus.pending && `${byStatus.pending} ожид.`, byStatus.confirmed && `${byStatus.confirmed} подтв.`, byStatus.completed && `${byStatus.completed} завер.`].filter(Boolean).join(" · ") || null },
    { label: "Кабинетов занято", value: `${usedRooms}/${activeRooms}`, sub: "из активных" },
    { label: "Мастеров работает", value: `${usedStaff}/${activePerformers}`, sub: "из доступных" },
    { label: "Ожидается", value: fmtMoney(expected), sub: null },
  ];
  return (
    <div className="flex flex-wrap gap-0 mb-4 bg-white border border-zinc-200 rounded-lg overflow-hidden">
      {blocks.map((b, i) => (
        <div key={i} className={`flex flex-col justify-center px-5 py-3 flex-1 min-w-32.5 ${i < blocks.length - 1 ? "border-r border-zinc-200" : ""}`}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">{b.label}</div>
          <div className="text-[18px] font-bold text-zinc-900 leading-none">{b.value}</div>
          {b.sub && <div className="text-[11px] text-zinc-400 mt-1">{b.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ── AppointmentDetail ─────────────────────────────────────────────────────────

function AppointmentDetail({ appointment, clients, services, staff, rooms, onClose, onEdit, onStatusChange }) {
  if (!appointment) return null;
  const c    = clients.find((x) => x.id === appointment.clientId);
  const room = (rooms || []).find((r) => r.id === appointment.roomId);
  const items = visitItems(appointment);
  const total = visitTotal(appointment);
  const due   = visitDue(appointment);
  const rem   = visitRemaining(appointment);
  const disc  = visitDiscount(appointment);
  const paid  = visitPaid(appointment);
  const clientName = c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name : "—";
  return (
    <aside className="w-75 shrink-0 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-y-auto sticky top-20 max-h-[calc(100vh-90px)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <div>
          <div className="text-[13px] font-semibold text-zinc-900">
            {new Date(appointment.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })} в {appointment.time}
          </div>
          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[appointment.status] || "bg-zinc-100 text-zinc-500"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />{STATUS_LABEL[appointment.status] || appointment.status}
          </span>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
      </div>
      <div className="px-4 py-3 space-y-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">Клиент</div>
          <div className="text-[14px] font-semibold text-zinc-900">{clientName}</div>
          {c?.phone && <div className="text-[12px] text-zinc-500 mt-0.5">{c.phone}</div>}
          {c?.notes && <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[12px] text-amber-800 leading-snug">⚠️ {c.notes}</div>}
        </div>
        {room && <div><div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">Кабинет</div><div className="text-[13px] text-zinc-900">{room.name}</div></div>}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1.5">Услуги</div>
          <div className="space-y-1.5">
            {items.map((item, i) => {
              const svc    = services.find((s) => s.id === item.serviceId);
              const staffM = staff.find((s) => s.id === item.staffId);
              return (
                <div key={i} className="flex items-start justify-between gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-md">
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-zinc-900 leading-tight">{svc?.name || "—"}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{staffM ? staffM.name.split(" ")[0] : "—"} · {item.duration} мин</div>
                  </div>
                  <div className="text-[12.5px] font-semibold text-zinc-900 shrink-0">{fmtMoney(item.price)}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-2.5 bg-zinc-50 rounded-md space-y-1 text-[12.5px]">
          <div className="flex justify-between"><span className="text-zinc-500">Сумма услуг</span><span className="text-zinc-900">{fmtMoney(total)}</span></div>
          {disc > 0 && <div className="flex justify-between"><span className="text-zinc-500">Скидка</span><span className="text-red-500">−{fmtMoney(disc)}</span></div>}
          <div className="flex justify-between font-semibold"><span>К оплате</span><span>{fmtMoney(due)}</span></div>
          {paid > 0 && <div className="flex justify-between"><span className="text-zinc-500">Оплачено</span><span className="text-zinc-700">{fmtMoney(paid)}</span></div>}
          <div className={`flex justify-between font-bold pt-1 border-t border-zinc-200 ${rem > 0 ? "text-red-600" : "text-green-600"}`}><span>Остаток</span><span>{fmtMoney(rem)}</span></div>
        </div>
        {appointment.notes && <div><div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">Заметка</div><div className="text-[12.5px] text-zinc-600 leading-snug">{appointment.notes}</div></div>}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1.5">Изменить статус</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(STATUS_LABEL).map(([k, label]) => (
              <button key={k} onClick={() => onStatusChange?.(appointment.id, k)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${appointment.status === k ? `${STATUS_BADGE[k]} ring-1 ring-current` : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => onEdit?.(appointment.id)}
            className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors">
            <IconEdit />Редактировать
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── CalendarGrid ──────────────────────────────────────────────────────────────

function CalendarGrid({ days, appointments, clients, services, rooms, staff, filterRoom, filterStaff, onCellClick, onEventClick }) {
  const nowTop = (() => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    if (mins < DAY_START || mins > DAY_START + SLOTS.length * 30) return null;
    return ((mins - DAY_START) / 30) * SLOT_H;
  })();

  const eventsByDay = useMemo(() => {
    const map = {};
    days.forEach((d) => {
      const dayAppts = appointments
        .filter((a) => a.date === d)
        .filter((a) => {
          if (!filterRoom || filterRoom === "all") return true;
          return a.roomId === filterRoom;
        })
        .filter((a) => {
          if (!filterStaff || filterStaff === "all") return true;
          return visitItems(a).some((i) => i.staffId === filterStaff);
        })
        .sort((a, b) => a.time.localeCompare(b.time));

      const items = dayAppts.map((a) => {
        const start = timeToMinutes(a.time);
        const end   = start + (visitDuration(a) || 30);
        return { a, start, end, col: 0, cols: 1 };
      });

      for (let i = 0; i < items.length; i++) {
        const used = new Set();
        for (let j = 0; j < i; j++) {
          if (items[j].end > items[i].start && items[j].start < items[i].end) used.add(items[j].col);
        }
        let c = 0; while (used.has(c)) c++;
        items[i].col = c;
      }
      items.forEach((cur) => {
        let max = cur.col;
        items.forEach((other) => { if (other !== cur && other.end > cur.start && other.start < cur.end && other.col > max) max = other.col; });
        cur.cols = max + 1;
      });
      map[d] = items;
    });
    return map;
  }, [days, appointments, filterRoom, filterStaff]);

  const todayStr = today();

  return (
    <div className="flex bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <div className="w-13 shrink-0 bg-zinc-50 border-r border-zinc-200">
        <div className="h-13 border-b border-zinc-200" />
        {SLOTS.map((s) => (
          <div key={s.time} style={{ height: SLOT_H }}
            className={`flex items-start justify-end pr-2 pt-1 text-[9px] font-medium ${s.isHour ? "border-b border-zinc-200 text-zinc-500" : "border-b border-dashed border-zinc-100 text-zinc-300"}`}>
            {s.time}
          </div>
        ))}
      </div>
      <div className="flex flex-1 min-w-0">
        {days.map((d) => {
          const isToday  = d === todayStr;
          const dt       = new Date(d);
          const dayCount = (eventsByDay[d] || []).length;
          const items    = eventsByDay[d] || [];
          return (
            <div key={d} className={`flex flex-col flex-1 min-w-0 border-r border-zinc-200 last:border-r-0 ${isToday ? "bg-blue-50/20" : ""}`}>
              <div className={`h-13 flex flex-col items-center justify-center border-b border-zinc-200 ${isToday ? "bg-blue-50" : "bg-zinc-50"}`}>
                <div className={`text-[11px] font-medium ${isToday ? "text-blue-600" : "text-zinc-400"}`}>{DAY_NAMES[dt.getDay()]}</div>
                <div className={`text-[15px] font-bold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white" : "text-zinc-900"}`}>{dt.getDate()}</div>
                {dayCount > 0 && <div className={`text-[9px] font-semibold px-1.5 rounded-full mt-0.5 ${isToday ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-500"}`}>{dayCount}</div>}
              </div>
              <div className="relative flex-1">
                {SLOTS.map((s) => (
                  <div key={s.time} style={{ height: SLOT_H }}
                    onClick={() => onCellClick?.(d, s.time)}
                    className={`w-full cursor-pointer hover:bg-blue-50/40 transition-colors ${s.isHour ? "border-b border-zinc-200" : "border-b border-dashed border-zinc-100"}`} />
                ))}
                {isToday && nowTop !== null && (
                  <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: nowTop }}>
                    <div className="relative h-0.5 bg-red-500"><div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500 shadow" /></div>
                  </div>
                )}
                {items.map(({ a, start, end, col, cols }) => {
                  const top      = ((start - DAY_START) / 30) * SLOT_H;
                  const height   = Math.max(SLOT_H - 2, ((end - start) / 30) * SLOT_H - 2);
                  const widthPct = 100 / cols, leftPct = col * widthPct;
                  const c         = clients.find((x) => x.id === a.clientId);
                  const firstName = c ? (c.firstName || c.name || "?").split(" ")[0] : "?";
                  const svc  = services.find((s) => s.id === a.items?.[0]?.serviceId);
                  const st   = STATUS_EVENT[a.status] || STATUS_EVENT.pending;
                  const room = (rooms || []).find((r) => r.id === a.roomId);
                  return (
                    <div key={a.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(a.id); }}
                      className={`absolute z-2 rounded-md border cursor-pointer overflow-hidden transition-all hover:-translate-y-px hover:shadow-md ${st.bg} ${st.border}`}
                      style={{ top, height, left: `calc(${leftPct}% + 3px)`, width: `calc(${widthPct}% - 6px)` }}>
                      <div className={`absolute left-0 top-0 bottom-0 w-0.75 rounded-l-md ${st.bar}`} />
                      <div className="pl-2 pr-1 pt-1 pb-1 h-full flex flex-col min-h-0">
                        <div className={`text-[10px] font-bold leading-tight ${st.text}`}>{a.time}</div>
                        <div className="text-[11px] font-semibold text-zinc-900 leading-tight truncate mt-0.5">{firstName}</div>
                        {height > 50 && svc  && <div className="text-[10px] text-zinc-500 leading-tight truncate mt-0.5">{svc.name}</div>}
                        {height > 70 && room && <div className="mt-auto text-[9px] font-medium bg-white/60 text-zinc-500 rounded px-1 self-start">{room.name}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main CalendarPage ─────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { data, loading, error, api } = useAppData();
  const { appointments, clients, services, staff, rooms } = data;

  const [view,        setView]        = useState("week");
  const [baseDate,    setBaseDate]    = useState(today());
  const [filterRoom,  setFilterRoom]  = useState("all");
  const [filterStaff, setFilterStaff] = useState("all");
  const [activeId,    setActiveId]    = useState(null);
  const [modal,       setModal]       = useState(null);

  const days = useMemo(() => {
    if (view === "day") return [baseDate];
    return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(baseDate), i));
  }, [view, baseDate]);

  const navLabel = useMemo(() => {
    if (view === "day") { const dt = new Date(baseDate); return `${DAY_NAMES_FULL[dt.getDay()]}, ${dt.getDate()} ${MONTH_NAMES[dt.getMonth()].toLowerCase()}`; }
    const start = new Date(days[0]), end = new Date(days[6]);
    if (start.getMonth() === end.getMonth()) return `${start.getDate()}–${end.getDate()} ${MONTH_NAMES[start.getMonth()].toLowerCase()} ${end.getFullYear()}`;
    return `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0,3).toLowerCase()} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0,3).toLowerCase()} ${end.getFullYear()}`;
  }, [view, baseDate, days]);

  const handleNav   = (n) => setBaseDate((d) => addDays(d, n * (view === "week" ? 7 : 1)));
  const activeAppt  = appointments.find((a) => a.id === activeId) || null;
  const performers  = staff.filter((s) => s.active !== false && (s.role === "cosmetologist" || s.role === "permanent"));
  const activeRooms = rooms.filter((r) => r.active !== false);

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>;
  if (error)   return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="flex flex-col gap-4">

      {modal && (
        <QuickBookModal
          date={modal.date}
          time={modal.time}
          clients={clients}
          services={services.length > 0 ? services : [
            { id: "s1", name: "Услуга 1", price: 1500, duration: 30 },
            { id: "s2", name: "Услуга 2", price: 2500, duration: 60 },
            { id: "s3", name: "Услуга 3", price: 3500, duration: 90 },
            { id: "s4", name: "Услуга 4", price: 5000, duration: 60 },
            { id: "s5", name: "Услуга 5", price: 1000, duration: 30 },
          ]}
          staff={staff}
          rooms={rooms}
          api={api}
          onSave={api.createAppointment}
          onClose={() => setModal(null)}
        />
      )}

      <DailySummary appointments={appointments} rooms={rooms} staff={staff} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button onClick={() => handleNav(-1)} className="w-8 h-8 flex items-center justify-center border border-zinc-200 rounded-md bg-white hover:bg-zinc-50 text-zinc-600 transition-colors"><ChevL /></button>
          <button onClick={() => setBaseDate(today())} className="h-8 px-3 border border-zinc-200 rounded-md bg-white text-[13px] text-zinc-700 hover:bg-zinc-50 transition-colors font-medium">Сегодня</button>
          <button onClick={() => handleNav(1)}  className="w-8 h-8 flex items-center justify-center border border-zinc-200 rounded-md bg-white hover:bg-zinc-50 text-zinc-600 transition-colors"><ChevR /></button>
          <span className="ml-2 text-[14px] font-semibold text-zinc-900 min-w-50">{navLabel}</span>
        </div>
        <div className="flex-1" />
        <div className="flex bg-zinc-100 p-0.5 rounded-md">
          {["day","week"].map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded text-[13px] font-medium transition-all ${view === v ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>
              {v === "day" ? "День" : "Неделя"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px]">
        <span className="text-zinc-400 text-[12px]">Кабинет:</span>
        <div className="flex bg-zinc-100 p-0.5 rounded gap-0.5">
          <button onClick={() => setFilterRoom("all")}
            className={`px-2.5 py-1 rounded text-[12px] font-medium transition-all ${filterRoom === "all" ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>
            Все
          </button>
          {activeRooms.map((r) => (
            <button key={r.id} onClick={() => setFilterRoom(r.id)}
              className={`px-2.5 py-1 rounded text-[12px] font-medium transition-all ${filterRoom === r.id ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>
              {r.name}
            </button>
          ))}
        </div>
        <span className="text-zinc-400 text-[12px] ml-2">Исполнитель:</span>
        <select value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)}
          className="h-7 px-2 pr-7 text-[12px] border border-zinc-200 rounded bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
          <option value="all">Все</option>
          {performers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <CalendarGrid
            days={days}
            appointments={appointments}
            clients={clients}
            services={services}
            rooms={rooms}
            staff={staff}
            filterRoom={filterRoom}
            filterStaff={filterStaff}
            onCellClick={(date, time) => { setActiveId(null); setModal({ date, time }); }}
            onEventClick={(id) => { setModal(null); setActiveId((prev) => (prev === id ? null : id)); }}
          />
        </div>
        {activeId && (
          <AppointmentDetail
            appointment={activeAppt}
            clients={clients}
            services={services}
            staff={staff}
            rooms={rooms}
            onClose={() => setActiveId(null)}
            onEdit={(id) => {}}
            onStatusChange={(id, status) => api.patchAppointment(id, { status })}
          />
        )}
      </div>
    </div>
  );
}