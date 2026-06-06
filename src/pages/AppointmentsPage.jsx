import { useState, useMemo } from "react";
import { useAppData } from "../api/useAppData";
import VisitBuilder from './VisitBuilder';

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0, 10); };
const fmtDateShort = (d) => new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с";

const STATUS = {
  pending:   { label: "Не подтверждена", badge: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Подтверждена",    badge: "bg-blue-100 text-blue-800" },
  arrived:   { label: "Клиент пришёл",   badge: "bg-purple-100 text-purple-800" },
  completed: { label: "Завершена",       badge: "bg-green-100 text-green-800" },
  no_show:   { label: "Не пришёл",       badge: "bg-zinc-100 text-zinc-500" },
  cancelled: { label: "Отменена",        badge: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${s.badge}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function DailySummary({ appointments, services }) {
  const todayStr = today();
  const todayAppts = appointments.filter((a) => a.date === todayStr);
  const byStatus = todayAppts.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});
  const expected = todayAppts.reduce((s, a) => s + (a.items || []).reduce((ss, i) => ss + (Number(i.price) || 0), 0), 0);
  const blocks = [
    { label: "Записей сегодня", value: todayAppts.length },
    { label: "Ожидаются", value: (byStatus.pending || 0) + (byStatus.confirmed || 0) },
    { label: "Завершено", value: byStatus.completed || 0 },
    { label: "Ожидается выручка", value: fmtMoney(expected) },
  ];
  return (
    <div className="flex flex-wrap gap-0 mb-4 bg-white border border-zinc-200 rounded-lg overflow-hidden">
      {blocks.map((b, i) => (
        <div key={i} className={`flex flex-col justify-center px-5 py-3 flex-1 min-w-30 ${i < blocks.length - 1 ? "border-r border-zinc-200" : ""}`}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">{b.label}</div>
          <div className="text-[18px] font-bold text-zinc-900 leading-none">{b.value}</div>
        </div>
      ))}
    </div>
  );
}

function CashPanel({ appointments }) {
  const todayStr = today();
  const appts = appointments.filter((a) => a.date === todayStr);
  let due = 0, cash = 0, card = 0, discount = 0, remaining = 0;
  appts.forEach((a) => {
    const total = (a.items || []).reduce((s, i) => s + (Number(i.price) || 0), 0);
    const disc = Math.max(0, Number(a.discount) || 0);
    const d = Math.max(0, total - disc);
    const paidCash = Math.max(0, Number(a.paidCash) || 0);
    const paidCard = Math.max(0, Number(a.paidCard) || 0);
    due += d; cash += paidCash; card += paidCard; discount += disc;
    remaining += Math.max(0, d - paidCash - paidCard);
  });
  return (
    <aside className="w-55 shrink-0 bg-white border border-zinc-200 rounded-xl overflow-hidden sticky top-20 shadow-sm">
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-3 bg-blue-50/60 border-b border-zinc-200">
        <div className="w-8.5 h-8.5 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
          </svg>
        </div>
        <div>
          <div className="text-[14px] font-bold text-zinc-900 leading-tight">Касса дня</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">{fmtDateShort(todayStr)} · {appts.length} записей</div>
        </div>
      </div>
      <div className="px-4 pt-3 pb-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">Начисление</div>
        <Row label="Сумма услуг" value={fmtMoney(due + discount)} />
        {discount > 0 && <Row label="Скидки" value={`−${fmtMoney(discount)}`} danger />}
        <Row label="К оплате" value={fmtMoney(due)} bold />
      </div>
      <div className="px-4 pt-2 pb-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">Поступление</div>
        <Row label="Наличными" value={fmtMoney(cash)} />
        <Row label="Б/Р (картой)" value={fmtMoney(card)} />
      </div>
      <div className="flex justify-between items-baseline px-4 py-3 mx-0 mt-1 bg-zinc-50 border-t border-b border-zinc-200">
        <span className="text-[12px] font-semibold text-zinc-900">Итого в кассе</span>
        <span className="text-[18px] font-bold text-zinc-900">{fmtMoney(cash + card)}</span>
      </div>
      <div className={`flex justify-between items-center px-4 py-2.5 text-[12px] ${remaining > 0 ? "text-red-600" : "text-green-700"}`}>
        <span>Остаток к доплате</span>
        <span className="text-[14px] font-bold">{fmtMoney(remaining)}</span>
      </div>
    </aside>
  );
}

function Row({ label, value, bold, danger }) {
  return (
    <div className="flex justify-between items-center py-0.75 text-[12.5px]">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-medium ${danger ? "text-red-600" : "text-zinc-900"} ${bold ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

export default function AppointmentsPage() {
  const { data, loading, error, api } = useAppData();
  const { appointments, clients, services, categories, staff } = data;

  const [filter, setFilter] = useState({ search: "", period: "today", status: "all", staffId: "all" });

  const todayStr = today();

  const filtered = useMemo(() => {
    const tomorrowStr = addDays(todayStr, 1);
    const weekEnd = addDays(todayStr, 7);
    const monthEnd = addDays(todayStr, 30);
    let list = [...appointments];
    if (filter.period === "today")    list = list.filter((a) => a.date === todayStr);
    if (filter.period === "tomorrow") list = list.filter((a) => a.date === tomorrowStr);
    if (filter.period === "week")     list = list.filter((a) => a.date >= todayStr && a.date <= weekEnd);
    if (filter.period === "month")    list = list.filter((a) => a.date >= todayStr && a.date <= monthEnd);
    if (filter.period === "past")     list = list.filter((a) => a.date < todayStr);
    if (filter.status !== "all")      list = list.filter((a) => a.status === filter.status);
    if (filter.staffId !== "all")     list = list.filter((a) => (a.items || []).some((i) => i.staffId === filter.staffId));
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter((a) => {
        const c = clients.find((x) => x.id === a.clientId);
        const clientName = c ? `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase() : "";
        const serviceNames = (a.items || []).map((i) => services.find((s) => s.id === i.serviceId)?.name || "").join(" ").toLowerCase();
        return clientName.includes(q) || serviceNames.includes(q);
      });
    }
    return list.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [appointments, clients, services, filter, todayStr]);

  const getClient = (id) => clients.find((c) => c.id === id);
  const clientName = (c) => c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name || "—" : "—";
  const visitTotal = (a) => (a.items || []).reduce((s, i) => s + (Number(i.price) || 0), 0);
  const visitDiscount = (a) => Math.max(0, Number(a.discount) || 0);
  const visitDue = (a) => Math.max(0, visitTotal(a) - visitDiscount(a));
  const visitPaidCash = (a) => Math.max(0, Number(a.paidCash) || 0);
  const visitPaidCard = (a) => Math.max(0, Number(a.paidCard) || 0);
  const visitPaid = (a) => visitPaidCash(a) + visitPaidCard(a);
  const visitRemaining = (a) => Math.max(0, visitDue(a) - visitPaid(a));

  const staffSummary = (a) => {
    const ids = [...new Set((a.items || []).map((i) => i.staffId).filter(Boolean))];
    const names = ids.map((id) => staff.find((s) => s.id === id)?.name).filter(Boolean);
    if (!names.length) return "—";
    const first = names[0].split(" ")[0];
    return names.length > 1 ? `${first} +${names.length - 1}` : first;
  };

  const servicesSummary = (a) => {
    const items = a.items || [];
    if (!items.length) return "—";
    const first = services.find((s) => s.id === items[0].serviceId)?.name || "—";
    return items.length > 1 ? `${first} +${items.length - 1}` : first;
  };

  const performers = staff.filter((s) => s.role === "cosmetologist" || s.role === "permanent");

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>;
  if (error)   return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="flex flex-col gap-4">
      <DailySummary appointments={appointments} services={services} />

<VisitBuilder
  clients={clients}
  services={services}
  categories={categories}
  staff={staff}
  rooms={data.rooms}
  onSave={api.createAppointment}
  onClientCreate={api.createClient}
/>

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-blue-50/40 border-b border-zinc-200">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-45 max-w-70">
                  <input type="text" placeholder="Поиск по клиенту или услуге"
                    value={filter.search} onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
                    className="w-full h-8 pl-8 pr-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <select value={filter.period} onChange={(e) => setFilter((f) => ({ ...f, period: e.target.value }))}
                  className="h-8 px-2.5 pr-7 text-[13px] border border-zinc-200 rounded-md bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
                  <option value="all">Все периоды</option>
                  <option value="today">Сегодня</option>
                  <option value="tomorrow">Завтра</option>
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                  <option value="past">Прошедшие</option>
                </select>
                <select value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
                  className="h-8 px-2.5 pr-7 text-[13px] border border-zinc-200 rounded-md bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
                  <option value="all">Все статусы</option>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filter.staffId} onChange={(e) => setFilter((f) => ({ ...f, staffId: e.target.value }))}
                  className="h-8 px-2.5 pr-7 text-[13px] border border-zinc-200 rounded-md bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
                  <option value="all">Все сотрудники</option>
                  {performers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-zinc-400">
                <div className="mt-3 text-[14px] font-medium text-zinc-500">Записей нет</div>
                <div className="text-[13px] mt-1">Попробуйте изменить фильтры</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      {["Дата и время","Клиент","Исполнитель","Услуги","Скидка","К оплате","Нал","Безнал","Остаток","Статус",""].map((h, i) => (
                        <th key={i} className={`px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500 whitespace-nowrap ${i >= 4 && i <= 8 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => {
                      const c = getClient(a.clientId);
                      const disc = visitDiscount(a);
                      const due = visitDue(a);
                      const cash = visitPaidCash(a);
                      const card = visitPaidCard(a);
                      const rem = visitRemaining(a);
                      return (
                        <tr key={a.id} className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors">
                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            <div className="font-semibold text-zinc-900">{fmtDateShort(a.date)}</div>
                            <div className="text-[11px] text-zinc-400">{a.time}</div>
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-zinc-900 whitespace-nowrap">{clientName(c)}</td>
                          <td className="px-3.5 py-2.5 text-zinc-500 whitespace-nowrap">{staffSummary(a)}</td>
                          <td className="px-3.5 py-2.5 text-zinc-500 max-w-45 truncate">{servicesSummary(a)}</td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            {disc > 0 ? <span className="text-zinc-500">−{fmtMoney(disc)}</span> : <span className="text-zinc-300">—</span>}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-semibold text-zinc-900 whitespace-nowrap">{fmtMoney(due)}</td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            {cash > 0 ? <span className="text-zinc-700">{fmtMoney(cash)}</span> : <span className="text-zinc-300">—</span>}
                          </td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            {card > 0 ? <span className="text-zinc-700">{fmtMoney(card)}</span> : <span className="text-zinc-300">—</span>}
                          </td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            <span className={`font-semibold ${rem > 0 ? "text-red-600" : "text-green-600"}`}>{fmtMoney(rem)}</span>
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                          <td className="px-3 py-2.5">
                            <select value={a.status}
                              onChange={(e) => api.patchAppointment(a.id, { status: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="h-7 px-2 text-[11px] border border-zinc-200 rounded bg-white appearance-none focus:outline-none cursor-pointer">
                              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <CashPanel appointments={appointments} />
      </div>
    </div>
  );
}