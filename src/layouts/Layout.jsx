import { useState, useMemo, useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
import { useAppData } from "../api/useAppData";

// ── Icons ─────────────────────────────────────────────────────────────────────

function HamburgerIcon() {
  return <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function PlusIcon() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconX() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconCheck() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconPlus() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);
const normName = (s) => (s || "").trim().toLowerCase().replace(/ё/g, "е");
const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с";

const STATUS_LABEL = {
  pending: "Не подтверждена", confirmed: "Подтверждена", arrived: "Клиент пришёл",
  completed: "Завершена", no_show: "Не пришёл", cancelled: "Отменена",
};

const FALLBACK_SERVICES = [
  { id: "s1", name: "Услуга 1", price: 1500, duration: 30 },
  { id: "s2", name: "Услуга 2", price: 2500, duration: 60 },
  { id: "s3", name: "Услуга 3", price: 3500, duration: 90 },
  { id: "s4", name: "Услуга 4", price: 5000, duration: 60 },
  { id: "s5", name: "Услуга 5", price: 1000, duration: 30 },
];

const ROOMS = [
  { id: "room1", name: "Кабинет 1", active: true },
  { id: "room2", name: "Кабинет 2", active: true },
  { id: "room3", name: "Кабинет 3", active: true },
  { id: "room4", name: "Кабинет 4", active: true },
  { id: "room5", name: "Кабинет 5", active: true },
];

// ── QuickBookModal ────────────────────────────────────────────────────────────

function QuickBookModal({ initialDate, initialTime, clients, services, staff, onSave, onClose }) {
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, []);

  const performers = staff.filter(s => s.active !== false && (s.role === "cosmetologist" || s.role === "permanent"));
  const allServices = services.length > 0 ? services : FALLBACK_SERVICES;

  const [lookup, setLookup]           = useState({ lastName: "", firstName: "", birthDate: "" });
  const [foundClient, setFoundClient] = useState(null);
  const [notFound, setNotFound]       = useState(false);
  const [form, setForm]               = useState({
    date: initialDate || today(),
    time: initialTime || "10:00",
    staffId: "", serviceId: "", roomId: "",
    status: "pending", discount: 0, paidCash: 0, paidCard: 0, notes: "",
  });
  const [items, setItems] = useState([]);

  const setF   = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm(f => ({ ...f, [k]: Number(e.target.value) || 0 }));

  const handleLookup = () => {
    const ln = normName(lookup.lastName), fn = normName(lookup.firstName), bd = lookup.birthDate;
    if (!ln || !fn || !bd) return;
    const found = clients.find(c => normName(c.lastName) === ln && normName(c.firstName) === fn && c.birthDate === bd);
    if (found) { setFoundClient(found); setNotFound(false); }
    else { setNotFound(true); setFoundClient(null); }
  };

  const pickerServices = form.staffId ? allServices : [];

  const handleAddService = () => {
    if (!form.staffId || !form.serviceId) return;
    const svc = allServices.find(s => s.id === form.serviceId);
    if (!svc) return;
    setItems(prev => [...prev, { id: Math.random().toString(36).slice(2), serviceId: svc.id, staffId: form.staffId, price: svc.price, duration: svc.duration }]);
    setForm(f => ({ ...f, serviceId: "" }));
  };

  const total     = items.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const disc      = Math.max(0, Number(form.discount) || 0);
  const due       = Math.max(0, total - disc);
  const paid      = Math.max(0, Number(form.paidCash) || 0) + Math.max(0, Number(form.paidCard) || 0);
  const remaining = Math.max(0, due - paid);

  const handleSave = async () => {
    if (!foundClient || !items.length) return;
    await onSave({
      clientId: foundClient.id,
      date: form.date, time: form.time,
      roomId: form.roomId || null,
      items, status: form.status,
      discount: form.discount, paidCash: form.paidCash, paidCard: form.paidCard,
      notes: form.notes,
    });
    onClose();
  };

  const clientName = foundClient ? `${foundClient.firstName || ""} ${foundClient.lastName || ""}`.trim() || foundClient.name : null;
  const inp = "w-full h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const sel = "w-full h-10 px-3 pr-8 text-[13px] border border-zinc-200 rounded-lg bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer";
  const lbl = "block text-[13px] font-medium text-zinc-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div ref={scrollRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 rounded-t-2xl shrink-0">
          <div className="text-[15px] font-bold text-zinc-900">
            Новая запись · {new Date(form.date + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} в {form.time}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* КЛИЕНТ */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Клиент</div>
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
                  <input placeholder="Фамилия" value={lookup.lastName}
                    onChange={e => setLookup(l => ({ ...l, lastName: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleLookup()}
                    className="flex-1 h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  <input placeholder="Имя" value={lookup.firstName}
                    onChange={e => setLookup(l => ({ ...l, firstName: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleLookup()}
                    className="flex-1 h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  <input type="date" value={lookup.birthDate}
                    onChange={e => setLookup(l => ({ ...l, birthDate: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleLookup()}
                    className="h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  <button onClick={handleLookup}
                    className="h-10 px-4 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-semibold rounded-lg transition-colors shrink-0">
                    Найти
                  </button>
                </div>
                {notFound && <div className="text-[12px] text-red-500">Клиент не найден. Проверьте данные или добавьте через раздел «Клиенты».</div>}
              </div>
            )}
          </div>

          {/* ВРЕМЯ */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Время визита</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Дата *</label><input type="date" value={form.date} onChange={setF("date")} className={inp} /></div>
              <div><label className={lbl}>Время *</label><input type="time" value={form.time} onChange={setF("time")} className={inp} /></div>
            </div>
          </div>

          {/* УСЛУГИ */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Услуги</div>
            {items.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <label className={lbl}>Услуги визита</label>
                {items.map((item, i) => {
                  const svc    = allServices.find(s => s.id === item.serviceId);
                  const staffM = staff.find(s => s.id === item.staffId);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[12.5px]">
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 truncate">{svc?.name || "—"}</div>
                        <div className="text-zinc-400 text-[11px]">{staffM?.name?.split(" ")[0]} · {item.duration} мин</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-zinc-900">{fmtMoney(item.price)}</span>
                        <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}
                          className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="space-y-2">
              <label className={lbl}>Добавить услугу</label>
              <select value={form.staffId} onChange={setF("staffId")} className={sel}>
                <option value="">— Выберите исполнителя —</option>
                {performers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {form.staffId && (
                <div className="flex gap-2">
                  <select value={form.serviceId} onChange={setF("serviceId")} className={`flex-1 ${sel}`}>
                    <option value="">— Услуга —</option>
                    {pickerServices.map(s => <option key={s.id} value={s.id}>{s.name} · {fmtMoney(s.price)}</option>)}
                  </select>
                  <button onClick={handleAddService} disabled={!form.serviceId}
                    className="h-10 px-3 inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg transition-colors shrink-0">
                    <IconPlus /><span>Добавить</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* СТАТУС И КАБИНЕТ */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Статус и кабинет</div>
            <div className="space-y-3">
              <div><label className={lbl}>Статус</label>
                <select value={form.status} onChange={setF("status")} className={sel}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Кабинет</label>
                <select value={form.roomId} onChange={setF("roomId")} className={sel}>
                  <option value="">— Не выбран —</option>
                  {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ДЕНЬГИ */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">Деньги</div>
            <div className="space-y-3">
              <div><label className={lbl}>Скидка (с)</label><input type="number" min="0" step="100" value={form.discount} onChange={setNum("discount")} className={inp} /></div>
              <div><label className={lbl}>Оплачено наличными (с)</label><input type="number" min="0" step="100" value={form.paidCash} onChange={setNum("paidCash")} className={inp} /></div>
              <div><label className={lbl}>Оплачено безналом (с)</label><input type="number" min="0" step="100" value={form.paidCard} onChange={setNum("paidCard")} className={inp} /></div>
              <div className="pt-1 space-y-1 text-[13px]">
                <div className="flex justify-between text-zinc-500"><span>Сумма услуг:</span><span>{fmtMoney(total)}</span></div>
                {disc > 0 && <div className="flex justify-between text-zinc-500"><span>Скидка:</span><span className="text-red-500">−{fmtMoney(disc)}</span></div>}
                <div className="flex justify-between text-zinc-500"><span>К оплате:</span><span className="font-semibold text-zinc-900">{fmtMoney(due)}</span></div>
                <div className={`flex justify-between font-bold ${remaining > 0 ? "text-red-600" : "text-green-600"}`}><span>Остаток:</span><span>{fmtMoney(remaining)}</span></div>
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

        {/* footer */}
        <div className="px-5 py-4 border-t border-zinc-100 rounded-b-2xl shrink-0 space-y-2">
          <button onClick={handleSave} disabled={!foundClient || !items.length}
            className="w-full h-11 inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-lg transition-colors">
            <IconCheck /><span>Сохранить</span>
          </button>
          <button onClick={onClose} className="w-full h-9 text-zinc-500 hover:text-zinc-800 text-[13px] font-medium transition-colors">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

// ── page meta ─────────────────────────────────────────────────────────────────

const PAGE_META = {
  "/appointments": { title: "Записи",          subtitle: "Список всех записей на приём",          actions: (h) => [{ label: "Новая запись", onClick: h.openNewAppointment, hideLabelMobile: true }] },
  "/calendar":     { title: "Календарь",        subtitle: "Управление записями",                   actions: (h) => [{ label: "Новая запись", onClick: h.openNewAppointment, hideLabelMobile: true }] },
  "/clients":      { title: "Клиенты",          subtitle: "База клиентов клиники",                 actions: () => [] },
  "/staff":        { title: "Сотрудники",       subtitle: "Загрузка специалистов на сегодня",      actions: () => [] },
  "/analytics":    { title: "Аналитика",        subtitle: "Сводные показатели работы клиники",     actions: () => [] },
  "/services":     { title: "Услуги",           subtitle: "Каталог услуг клиники",                 actions: () => [] },
  "/products":     { title: "Товары и склад",   subtitle: "Препараты и расходные материалы",       actions: () => [] },
  "/settings":     { title: "Настройки",        subtitle: "Управление системой",                   actions: () => [] },
};

// ── Layout ────────────────────────────────────────────────────────────────────

export default function Layout({
  clinic = { name: "PROlab Medical", shortName: "PROlab", logo: "" },
  user = { name: "Администратор", role: "admin" },
  counters = {},
  onLogout,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const location = useLocation();

  const { data, api } = useAppData();
  const { clients, services, staff } = data;

  const metaKey = Object.keys(PAGE_META).find(k => location.pathname === k) ||
                  Object.keys(PAGE_META).find(k => location.pathname.startsWith(k + "/")) || null;
  const meta = metaKey ? PAGE_META[metaKey] : null;

  const actionHandlers = { openNewAppointment: () => setModalOpen(true) };
  const topbarActions  = meta ? meta.actions(actionHandlers) : [];

  return (
    <div className="flex min-h-screen bg-zinc-50">

      {modalOpen && (
        <QuickBookModal
          clients={clients}
          services={services}
          staff={staff}
          onSave={api.createAppointment}
          onClose={() => setModalOpen(false)}
        />
      )}

      <SidebarNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        clinicName={clinic.name}
        clinicShortName={clinic.shortName}
        clinicLogo={clinic.logo}
        userName={user.name}
        userRole={user.role}
        counters={counters}
        onLogout={onLogout}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="sticky top-0 z-10 flex items-center gap-3 min-h-16 px-6 bg-white border-b border-zinc-200">
          <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors"
            onClick={() => setSidebarOpen(true)} aria-label="Открыть меню">
            <HamburgerIcon />
          </button>

          <div className="flex-1 min-w-0">
            {meta ? (
              <>
                <h1 className="text-[22px] font-bold tracking-tight text-zinc-900 leading-tight">{meta.title}</h1>
                {meta.subtitle && <p className="text-[13px] text-zinc-500 mt-0.5">{meta.subtitle}</p>}
              </>
            ) : (
              <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">{clinic.name}</h1>
            )}
          </div>

          {topbarActions.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {topbarActions.map((action, i) => (
                <button key={i} onClick={action.onClick}
                  className="h-8 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors">
                  <PlusIcon />
                  <span className={action.hideLabelMobile ? "hidden sm:inline" : ""}>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}