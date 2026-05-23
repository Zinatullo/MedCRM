import { useState, useMemo } from "react";
import { useAppData } from "../api/useAppData";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }) : "—";
const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с";

const TAG = {
  vip:     { label: "VIP",        cls: "bg-purple-100 text-purple-800" },
  regular: { label: "Постоянный", cls: "bg-blue-100 text-blue-800" },
  new:     { label: "Новый",      cls: "bg-green-100 text-green-800" },
};

const STATUS_BADGE = {
  pending:   "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  arrived:   "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  no_show:   "bg-zinc-100 text-zinc-500",
  cancelled: "bg-red-100 text-red-700",
};
const STATUS_LABEL = {
  pending:   "Ожидает",
  confirmed: "Подтв.",
  arrived:   "Пришёл",
  completed: "Заверш.",
  no_show:   "Не пришёл",
  cancelled: "Отменена",
};

function clientFullName(c) {
  return c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name || "—" : "—";
}
function initials(name) {
  return (name || "").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function InlineAddClient({ onAdd }) {
  const [form, setForm] = useState({ lastName: "", firstName: "", phone: "", birthDate: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const handleAdd = () => {
    if (!form.lastName.trim() || !form.firstName.trim() || !form.phone.trim() || !form.birthDate) return;
    onAdd?.({ ...form });
    setForm({ lastName: "", firstName: "", phone: "", birthDate: "" });
  };
  return (
    <div className="flex flex-wrap gap-2 items-center p-3 mb-3 bg-zinc-50 border border-zinc-200 rounded-lg">
      <input type="text" placeholder="Фамилия *" value={form.lastName} onChange={set("lastName")}
        className="flex-1 min-w-32.5 h-8 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
      <input type="text" placeholder="Имя *" value={form.firstName} onChange={set("firstName")}
        className="flex-1 min-w-32.5 h-8 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
      <input type="tel" placeholder="WhatsApp *" value={form.phone} onChange={set("phone")}
        className="flex-1 min-w-35 h-8 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
      <input type="date" value={form.birthDate} onChange={set("birthDate")}
        className="h-8 px-2 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
      <button onClick={handleAdd}
        className="h-8 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors">
        + Добавить
      </button>
    </div>
  );
}

function ClientDetail({ client, appointments, services, onClose, onEdit }) {
  if (!client) return null;
  const visits = (appointments || []).filter((a) => a.clientId === client.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const completed = visits.filter((v) => v.status === "completed");
  const totalRevenue = completed.reduce((s, a) => {
    const total = (a.items || []).reduce((ss, i) => ss + (Number(i.price) || 0), 0);
    return s + Math.max(0, total - Math.max(0, Number(a.discount) || 0));
  }, 0);
  const totalRemaining = visits.filter((v) => v.status !== "cancelled" && v.status !== "no_show").reduce((s, a) => {
    const total = (a.items || []).reduce((ss, i) => ss + (Number(i.price) || 0), 0);
    const disc = Math.max(0, Number(a.discount) || 0);
    const paid = Math.max(0, Number(a.paidCash) || 0) + Math.max(0, Number(a.paidCard) || 0);
    return s + Math.max(0, total - disc - paid);
  }, 0);
  const age = (() => {
    if (!client.birthDate) return null;
    const y = Math.floor((Date.now() - new Date(client.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    if (y < 1 || y > 120) return null;
    const s = y % 10 === 1 && y % 100 !== 11 ? "год" : y % 10 >= 2 && y % 10 <= 4 && (y % 100 < 10 || y % 100 >= 20) ? "года" : "лет";
    return `${y} ${s}`;
  })();
  const tag = TAG[client.tag] || TAG.new;
  const name = clientFullName(client);
  return (
    <aside className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-y-auto sticky top-20 max-h-[calc(100vh-90px)] relative">
      <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 transition-colors z-10">✕</button>
      <div className="px-5 pt-5 pb-6 space-y-5">
        <div className="flex items-center gap-3 pr-8">
          <div className="w-11 h-11 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[15px] font-semibold shrink-0">{initials(name)}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[18px] font-bold text-zinc-900 leading-tight">{name}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${tag.cls}`}>{tag.label}</span>
            </div>
            <div className="text-[12px] text-zinc-500 mt-0.5">{client.phone}{client.email ? ` · ${client.email}` : ""}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit?.(client.id)}
            className="h-8 px-3 flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-[13px] font-medium rounded-md transition-colors text-zinc-700">
            Редактировать
          </button>
        </div>
        {client.notes ? (
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-l-4 border-amber-200 border-l-amber-500 rounded-lg">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-amber-700 mb-1">Внимание перед процедурой</div>
              <div className="text-[13px] font-semibold text-amber-900 leading-snug">{client.notes}</div>
            </div>
          </div>
        ) : (
          <div className="p-3 border border-dashed border-zinc-200 rounded-lg text-[12px] text-zinc-400 text-center">Медицинских заметок нет</div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-[0.4px] text-zinc-400 font-medium">Визитов</div>
            <div className="mt-1 text-[18px] font-bold text-zinc-900">{visits.length}</div>
            {completed.length > 0 && <div className="text-[11px] text-zinc-400 mt-1">{completed.length} заверш.</div>}
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-[0.4px] text-zinc-400 font-medium">Долг</div>
            <div className={`mt-1 text-[18px] font-bold ${totalRemaining > 0 ? "text-red-600" : "text-zinc-900"}`}>{fmtMoney(totalRemaining)}</div>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-[0.4px] text-zinc-400 font-medium">Последний</div>
            <div className="mt-1 text-[15px] font-bold text-zinc-900">{visits[0] ? fmtDateShort(visits[0].date) : "—"}</div>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">История визитов · {visits.length}</div>
          {visits.length === 0 ? (
            <div className="text-[12px] text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-lg">Записей нет</div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-[12.5px] border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-3 py-2 text-left font-medium text-zinc-500">Дата</th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-500">Услуги</th>
                    <th className="px-3 py-2 text-right font-medium text-zinc-500">Сумма</th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-500">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((a) => {
                    const total = (a.items || []).reduce((s, i) => s + (Number(i.price) || 0), 0);
                    const firstSvc = services?.find((s) => s.id === a.items?.[0]?.serviceId);
                    const extra = (a.items?.length || 1) - 1;
                    return (
                      <tr key={a.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                        <td className="px-3 py-2 whitespace-nowrap font-medium text-zinc-900">{fmtDateShort(a.date)} {a.time}</td>
                        <td className="px-3 py-2 text-zinc-500 max-w-35 truncate">{firstSvc?.name || "—"}{extra > 0 ? ` +${extra}` : ""}</td>
                        <td className="px-3 py-2 text-right font-semibold text-zinc-900">{fmtMoney(total)}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_BADGE[a.status] || "bg-zinc-100 text-zinc-500"}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />{STATUS_LABEL[a.status] || a.status}
                          </span>
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
    </aside>
  );
}

export default function ClientsPage() {
  const { data, loading, error, api } = useAppData();
  const { clients, appointments, services } = data;

  const [filter, setFilter] = useState({ search: "", tag: "all" });
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...clients];
    if (filter.tag !== "all") list = list.filter((c) => c.tag === filter.tag);
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter((c) => clientFullName(c).toLowerCase().includes(q) || (c.phone || "").includes(q));
    }
    return list.sort((a, b) => clientFullName(a).localeCompare(clientFullName(b), "ru"));
  }, [clients, filter]);

  const activeClient = clients.find((c) => c.id === activeId) || null;

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>;
  if (error)   return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="flex flex-col gap-3">
      <InlineAddClient onAdd={api.createClient} />
      <div className="flex gap-4 items-start">
        <div className={`min-w-0 ${activeId ? "hidden lg:block lg:w-105 lg:shrink-0" : "flex-1"}`}>
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-blue-50/40 border-b border-zinc-200">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-45">
                  <input type="text" placeholder="Поиск по имени или телефону"
                    value={filter.search} onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
                    className="w-full h-8 pl-8 pr-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex bg-zinc-100 p-0.5 rounded-md gap-0.5">
                  {[["all","Все"],["vip","VIP"],["regular","Постоянные"],["new","Новые"]].map(([k, v]) => (
                    <button key={k} onClick={() => setFilter((f) => ({ ...f, tag: k }))}
                      className={`px-2.5 py-1 rounded text-[12px] font-medium transition-all ${filter.tag === k ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="py-14 text-center text-zinc-400 text-[13px]">Клиентов не найдено</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Клиент</th>
                      <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Телефон</th>
                      <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Тип</th>
                      <th className="px-3.5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const tag = TAG[c.tag] || TAG.new;
                      const name = clientFullName(c);
                      return (
                        <tr key={c.id} onClick={() => setActiveId((id) => (id === c.id ? null : c.id))}
                          className={`border-b border-zinc-100 cursor-pointer transition-colors hover:bg-zinc-50 ${activeId === c.id ? "bg-blue-50/50" : ""}`}>
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[12px] font-semibold shrink-0">{initials(name)}</div>
                              <span className="font-medium text-zinc-900">{name}</span>
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 text-zinc-500">{c.phone}</td>
                          <td className="px-3.5 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${tag.cls}`}>{tag.label}</span>
                          </td>
                          <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => {}} className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">✎</button>
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
        {activeId ? (
          <ClientDetail client={activeClient} appointments={appointments} services={services} onClose={() => setActiveId(null)} onEdit={() => {}} />
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center min-h-75 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-[13px] text-center">
            <div><div className="text-[40px] mb-2">👤</div>Выберите клиента из списка</div>
          </div>
        )}
      </div>
    </div>
  );
}