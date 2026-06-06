import { useState, useMemo } from "react";
import { useAppData } from "../api/useAppData";
import VisitBuilder from "./VisitBuilder"

;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const fmtDateShort = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }) : "—";
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
  pending: "Ожидает", confirmed: "Подтверждена", arrived: "Пришёл",
  completed: "Завершена", no_show: "Не пришёл", cancelled: "Отменена",
};

function clientFullName(c) {
  return c ? `${c.lastName || ""} ${c.firstName || ""}`.trim() || c.name || "—" : "—";
}
function initials(name) {
  return (name || "").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}
function calcAge(birthDate) {
  if (!birthDate) return null;
  const y = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  if (y < 1 || y > 120) return null;
  const s = y % 10 === 1 && y % 100 !== 11 ? "год" : y % 10 >= 2 && y % 10 <= 4 && (y % 100 < 10 || y % 100 >= 20) ? "года" : "лет";
  return `${y} ${s}`;
}

const IconX      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheck  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconEdit   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconSearch = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconTrash  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
const IconPlus   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconInfo   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>

function EditClientModal({ client, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    firstName: client?.firstName || "",
    lastName:  client?.lastName  || "",
    phone:     client?.phone     || "",
    email:     client?.email     || "",
    birthDate: client?.birthDate || "",
    tag:       client?.tag       || "new",
    notes:     client?.notes     || "",
  });
  const [busy,    setBusy]    = useState(false);
  const [confirm, setConfirm] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = "w-full h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const sel = "w-full h-10 px-3 pr-8 text-[13px] border border-zinc-200 rounded-lg bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer";
  const lbl = "block text-[13px] font-medium text-zinc-700 mb-1.5";

  const handleSave = async () => {
    setBusy(true);
    try {
      await onSave({ ...form, name: `${form.firstName.trim()} ${form.lastName.trim()}` });
      onClose();
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    setBusy(true);
    try { await onDelete(client.id); onClose(); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      {confirm ? (
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-[360px] p-6" onClick={e => e.stopPropagation()}>
          <div className="text-[16px] font-bold text-zinc-900 mb-2">Удалить клиента?</div>
          <div className="text-[13px] text-zinc-500 mb-5">«{clientFullName(client)}» будет удалён без возможности восстановления.</div>
          <div className="flex gap-2">
            <button onClick={() => setConfirm(false)} className="flex-1 h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[14px] font-medium rounded-lg transition-colors">Отмена</button>
            <button onClick={handleDelete} disabled={busy} className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white text-[14px] font-semibold rounded-lg transition-colors">{busy ? "Удаление…" : "Удалить"}</button>
          </div>
        </div>
      ) : (
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <div className="text-[16px] font-bold text-zinc-900">Редактировать клиента</div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className={lbl}>Имя и фамилия *</label>
              <input placeholder="Айгерим Иванова" value={`${form.firstName} ${form.lastName}`.trim()}
                onChange={e => {
                  const parts = e.target.value.split(" ");
                  setForm(f => ({ ...f, firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" }));
                }} className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Телефон *</label><input type="tel" placeholder="+996 700 000 000" value={form.phone} onChange={set("phone")} className={inp} /></div>
              <div><label className={lbl}>Email</label><input type="email" placeholder="example@mail.com" value={form.email} onChange={set("email")} className={inp} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Дата рождения</label><input type="date" value={form.birthDate} onChange={set("birthDate")} className={inp} /></div>
              <div><label className={lbl}>Тип клиента</label>
                <select value={form.tag} onChange={set("tag")} className={sel}>
                  <option value="new">Новый</option>
                  <option value="regular">Постоянный</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
            <div><label className={lbl}>Заметки</label>
              <textarea value={form.notes} onChange={set("notes")} rows={3} placeholder="Аллергии, противопоказания, предпочтения"
                className="w-full px-3 py-2.5 text-[13px] border border-zinc-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <div className="px-5 py-4 border-t border-zinc-100 flex items-center justify-between">
            <button onClick={() => setConfirm(true)} className="h-9 px-3 inline-flex items-center gap-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[13px] font-medium rounded-lg transition-colors">
              <IconTrash />Удалить
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="h-9 px-4 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[13px] font-medium rounded-lg transition-colors">Отмена</button>
              <button onClick={handleSave} disabled={busy} className="h-9 px-4 inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-semibold rounded-lg transition-colors">
                <IconCheck />{busy ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline Edit Panel ─────────────────────────────────────────────────────────

function EditPanel({ client, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    firstName: client?.firstName || "",
    lastName:  client?.lastName  || "",
    phone:     client?.phone     || "",
    email:     client?.email     || "",
    birthDate: client?.birthDate || "",
    tag:       client?.tag       || "new",
    notes:     client?.notes     || "",
  });
  const [busy,    setBusy]    = useState(false);
  const [confirm, setConfirm] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = "w-full h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const sel = "w-full h-10 px-3 pr-8 text-[13px] border border-zinc-200 rounded-lg bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer";
  const lbl = "block text-[12px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1.5";

  const handleSave = async () => {
    setBusy(true);
    try {
      await onSave({ ...form, name: `${form.firstName.trim()} ${form.lastName.trim()}` });
      onClose();
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    setBusy(true);
    try { await onDelete(client.id); onClose(); } finally { setBusy(false); }
  };

  const name = clientFullName(client);

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 shrink-0">
        <div className="w-9 h-9 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[13px] font-semibold shrink-0">{initials(name)}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-zinc-900">Редактирование карточки</div>
          <div className="text-[12px] text-zinc-500">{name}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onClose} className="h-8 px-3 inline-flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[13px] font-medium rounded-md transition-colors">
            <IconX />Отмена
          </button>
          <button onClick={handleSave} disabled={busy} className="h-8 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400 text-white text-[13px] font-semibold rounded-md transition-colors">
            <IconCheck />{busy ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>

      {/* body */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
        {/* личное */}
        <div>
          <div className={lbl}>Личное</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="block text-[12px] text-zinc-600 mb-1">Фамилия *</label><input placeholder="Фамилия" value={form.lastName} onChange={set("lastName")} className={inp} /></div>
            <div><label className="block text-[12px] text-zinc-600 mb-1">Имя *</label><input placeholder="Имя" value={form.firstName} onChange={set("firstName")} className={inp} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[12px] text-zinc-600 mb-1">Дата рождения *</label><input type="date" value={form.birthDate} onChange={set("birthDate")} className={inp} /></div>
            <div><label className="block text-[12px] text-zinc-600 mb-1">Тип клиента</label>
              <select value={form.tag} onChange={set("tag")} className={sel}>
                <option value="new">Новый</option>
                <option value="regular">Постоянный</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
        </div>

        {/* контакты */}
        <div>
          <div className={lbl}>Контакты</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[12px] text-zinc-600 mb-1">Телефон / WhatsApp *</label><input type="tel" placeholder="+996 700 000 000" value={form.phone} onChange={set("phone")} className={inp} /></div>
            <div><label className="block text-[12px] text-zinc-600 mb-1">Email</label><input type="email" placeholder="example@mail.com" value={form.email} onChange={set("email")} className={inp} /></div>
          </div>
        </div>

        {/* заметки */}
        <div>
          <div className={lbl}>Медицинские заметки</div>
          <textarea value={form.notes} onChange={set("notes")} rows={4}
            placeholder="Аллергии, противопоказания, особенности — будет видно перед каждой процедурой"
            className="w-full px-3 py-2.5 text-[13px] border border-zinc-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>
      </div>

      {/* footer */}
      <div className="px-5 py-4 border-t border-zinc-100 shrink-0 flex items-center justify-between">
        {confirm ? (
          <div className="flex items-center gap-2 w-full">
            <span className="text-[13px] text-red-600 font-medium flex-1">Удалить клиента?</span>
            <button onClick={() => setConfirm(false)} className="h-8 px-3 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[13px] rounded-md transition-colors">Нет</button>
            <button onClick={handleDelete} disabled={busy} className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium rounded-md transition-colors">{busy ? "…" : "Да, удалить"}</button>
          </div>
        ) : (
          <>
            <button onClick={() => setConfirm(true)} className="h-8 px-3 inline-flex items-center gap-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[13px] font-medium rounded-md transition-colors">
              <IconTrash />Удалить клиента
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="h-8 px-3 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[13px] rounded-md transition-colors">Отмена</button>
              <button onClick={handleSave} disabled={busy} className="h-8 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-semibold rounded-md transition-colors">
                <IconCheck />{busy ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── ClientDetail ──────────────────────────────────────────────────────────────
// в ClientDetail — добавить проп onBook
function ClientDetail({ client, appointments, services, onClose, onEdit, onBook }) {
  if (!client) return null;
  const visits    = (appointments || []).filter(a => a.clientId === client.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const completed = visits.filter(v => v.status === "completed");
  const totalRemaining = visits.filter(v => v.status !== "cancelled" && v.status !== "no_show").reduce((s, a) => {
    const total = (a.items || []).reduce((ss, i) => ss + (Number(i.price) || 0), 0);
    const disc  = Math.max(0, Number(a.discount) || 0);
    const paid  = Math.max(0, Number(a.paidCash) || 0) + Math.max(0, Number(a.paidCard) || 0);
    return s + Math.max(0, total - disc - paid);
  }, 0);
  const lastVisit = visits[0];
  const age  = calcAge(client.birthDate);
  const tag  = TAG[client.tag] || TAG.new;
  const name = clientFullName(client);

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-zinc-100 shrink-0">
        <div className="w-11 h-11 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[15px] font-bold shrink-0">{initials(name)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[17px] font-bold text-zinc-900">{name}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${tag.cls}`}>{tag.label}</span>
          </div>
          <div className="text-[12px] text-zinc-500 mt-0.5 font-medium">{client.phone}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onEdit("edit")} className="h-8 px-3 inline-flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-[13px] font-medium rounded-md transition-colors text-zinc-700">
            <IconEdit />Редактировать
          </button>
<button onClick={() => onBook(client)} className="h-8 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors">
  <IconPlus />Запись
</button>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
        {/* medical notes */}
        <div onClick={() => onEdit("edit")} className="flex items-start gap-3 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-100 transition-colors">
          <span className="text-zinc-400 mt-0.5 shrink-0"><IconInfo /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-zinc-400 mb-1">Медицинские заметки</div>
            {client.notes
              ? <div className="text-[13px] font-medium text-zinc-800">{client.notes}</div>
              : <div className="text-[12px] text-zinc-400">Нажмите, чтобы добавить аллергии, противопоказания или особенности — будет видно перед каждой процедурой.</div>
            }
          </div>
          <span className="text-zinc-400 shrink-0"><IconEdit /></span>
        </div>

        {/* личное */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-zinc-400 mb-2">Личное</div>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            {[
              { label: "Фамилия",      value: client.lastName || "—" },
              { label: "Имя",          value: client.firstName || "—" },
              { label: "День рождения",value: client.birthDate ? `${fmtDate(client.birthDate)}${age ? ` · ${age}` : ""}` : "—" },
              { label: "Тип клиента",  value: <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${tag.cls}`}>{tag.label}</span> },
            ].map((row, i, arr) => (
              <div key={i} className={`flex items-center justify-between px-3.5 py-2.5 ${i < arr.length - 1 ? "border-b border-zinc-100" : ""}`}>
                <span className="text-[13px] text-zinc-500 font-medium">{row.label}</span>
                <span className="text-[13px] font-semibold text-zinc-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* контакты */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-zinc-400 mb-2">Контакты</div>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            {[
              { label: "Телефон / WhatsApp", value: client.phone || "—" },
              { label: "Email",              value: client.email || "—" },
            ].map((row, i, arr) => (
              <div key={i} className={`flex items-center justify-between px-3.5 py-2.5 ${i < arr.length - 1 ? "border-b border-zinc-100" : ""}`}>
                <span className="text-[13px] text-zinc-500 font-medium">{row.label}</span>
                <span className="text-[13px] font-semibold text-zinc-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* сводка */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-zinc-400 mb-2">Сводка</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[0.4px] text-zinc-400 font-semibold mb-1">Всего визитов</div>
              <div className="text-[20px] font-bold text-zinc-900">{visits.length}</div>
              {completed.length > 0 && <div className="text-[11px] text-zinc-400 font-medium">{completed.length} завер.</div>}
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[0.4px] text-zinc-400 font-semibold mb-1">Долг</div>
              <div className={`text-[18px] font-bold ${totalRemaining > 0 ? "text-red-600" : "text-zinc-900"}`}>{fmtMoney(totalRemaining)}</div>
              {totalRemaining > 0 && <div className="text-[11px] text-zinc-400 font-medium">по активным визитам</div>}
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[0.4px] text-zinc-400 font-semibold mb-1">Последний визит</div>
              <div className="text-[16px] font-bold text-zinc-900">{lastVisit ? fmtDate(lastVisit.date) : "—"}</div>
              {lastVisit && <div className="text-[11px] text-zinc-400 font-medium">{lastVisit.time}</div>}
            </div>
          </div>
        </div>

        {/* системное */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-zinc-400 mb-2">Системное</div>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-100">
              <span className="text-[13px] text-zinc-500 font-medium">Клиент с</span>
              <span className="text-[13px] font-semibold text-zinc-900">{client.createdAt ? fmtDate(client.createdAt) : "—"}</span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-[13px] text-zinc-500 font-medium">ID</span>
              <span className="font-mono text-[12px] text-zinc-400">{client.id}</span>
            </div>
          </div>
        </div>

        {/* история */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-zinc-400 mb-2">История визитов · {visits.length}</div>
          {visits.length === 0 ? (
            <div className="text-[12px] text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-lg">Записей нет</div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-[12.5px] border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-3 py-2 text-left font-semibold text-zinc-500">Дата</th>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-500">Услуги</th>
                    <th className="px-3 py-2 text-right font-semibold text-zinc-500">Сумма</th>
                    <th className="px-3 py-2 text-left font-semibold text-zinc-500">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map(a => {
                    const total    = (a.items || []).reduce((s, i) => s + (Number(i.price) || 0), 0);
                    const firstSvc = services?.find(s => s.id === a.items?.[0]?.serviceId);
                    const extra    = (a.items?.length || 1) - 1;
                    return (
                      <tr key={a.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                        <td className="px-3 py-2 whitespace-nowrap font-semibold text-zinc-900">{fmtDateShort(a.date)} {a.time}</td>
                        <td className="px-3 py-2 text-zinc-500 max-w-[140px] truncate">{firstSvc?.name || "—"}{extra > 0 ? ` +${extra}` : ""}</td>
                        <td className="px-3 py-2 text-right font-bold text-zinc-900">{fmtMoney(total)}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_BADGE[a.status] || "bg-zinc-100 text-zinc-500"}`}>
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
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const { data, loading, error, api } = useAppData();
const [bookingClient, setBookingClient] = useState(null);
const { clients, appointments, services, staff, rooms } = data; // добавить staff и rooms
  const [filter,    setFilter]    = useState({ search: "", tag: "all" });
  const [activeId,  setActiveId]  = useState(null);
  const [rightPanel, setRightPanel] = useState(null); // null | "detail" | "edit"
  const [addForm,   setAddForm]   = useState({ lastName: "", firstName: "", phone: "", birthDate: "" });
const [modalClient, setModalClient] = useState(null);

  const filtered = useMemo(() => {
    let list = [...clients];
    if (filter.tag !== "all") list = list.filter(c => c.tag === filter.tag);
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter(c => clientFullName(c).toLowerCase().includes(q) || (c.phone || "").includes(q));
    }
    return list.sort((a, b) => clientFullName(a).localeCompare(clientFullName(b), "ru"));
  }, [clients, filter]);

  const activeClient = clients.find(c => c.id === activeId) || null;

  const handleRowClick = (id) => {
    if (activeId === id) { setActiveId(null); setRightPanel(null); }
    else { setActiveId(id); setRightPanel("detail"); }
  };

  const handleAdd = async () => {
    if (!addForm.lastName.trim() || !addForm.firstName.trim() || !addForm.phone.trim() || !addForm.birthDate) return;
    await api.createClient({ ...addForm });
    setAddForm({ lastName: "", firstName: "", phone: "", birthDate: "" });
  };

  const handleSaveEdit = async (formData) => {
    await api.updateClient(activeClient.id, formData);
    setRightPanel("detail");
  };

  const handleDelete = async (id) => {
    await api.deleteClient(id);
    setActiveId(null);
    setRightPanel(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>;
  if (error)   return <div className="text-red-500 p-4">{error}</div>;

  const showRight = activeId && rightPanel;

  return (
    <div className="flex flex-col gap-3">
      {bookingClient && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setBookingClient(null)}>
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[16px] font-bold text-zinc-900">Новая запись · {clientFullName(bookingClient)}</div>
        <button onClick={() => setBookingClient(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
      </div>
      <VisitBuilder
        clients={[bookingClient]}
        services={services}
        categories={data.serviceCategories}
        staff={staff}
        rooms={rooms}
        onSave={async (visitData) => { await api.createAppointment(visitData); setBookingClient(null); }}
        onClientCreate={api.createClient}
        prefillClient={bookingClient}
      />
    </div>
  </div>
)}
      {modalClient && (
  <EditClientModal
    client={modalClient}
    onSave={async (formData) => { await api.updateClient(modalClient.id, formData); setModalClient(null); }}
    onDelete={async (id) => { await api.deleteClient(id); setModalClient(null); setActiveId(null); setRightPanel(null); }}
    onClose={() => setModalClient(null)}
  />
)}
      {/* inline add
      <div className="flex flex-wrap gap-2 items-center bg-white border border-zinc-200 rounded-xl px-4 py-3 shadow-sm">
        <input type="text" placeholder="Фамилия *" value={addForm.lastName} onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))}
          className="flex-1 min-w-32 h-9 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        <input type="text" placeholder="Имя *" value={addForm.firstName} onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))}
          className="flex-1 min-w-32 h-9 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        <input type="tel" placeholder="WhatsApp *" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
          className="flex-1 min-w-36 h-9 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        <input type="date" value={addForm.birthDate} onChange={e => setAddForm(f => ({ ...f, birthDate: e.target.value }))}
          className="h-9 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        <button onClick={handleAdd} className="h-9 px-4 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors">
          <IconPlus />Добавить
        </button>
      </div> */}

      <div className="flex gap-3 items-start">
        {/* list — всегда 50% если открыта панель */}
        <div className={`min-w-0 ${showRight ? "w-1/2 shrink-0" : "flex-1"}`}>
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-blue-50/40 border-b border-zinc-200">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-40">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"><IconSearch /></span>
                  <input type="text" placeholder="Поиск по имени или телефону"
                    value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                    className="w-full h-8 pl-8 pr-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex bg-zinc-100 p-0.5 rounded-md gap-0.5">
                  {[["all","Все"],["vip","VIP"],["regular","Постоянные"],["new","Новые"]].map(([k, v]) => (
                    <button key={k} onClick={() => setFilter(f => ({ ...f, tag: k }))}
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
                      <th className="px-3.5 py-2.5 text-left text-[12px] font-semibold text-zinc-500">Клиент</th>
                      <th className="px-3.5 py-2.5 text-left text-[12px] font-semibold text-zinc-500">Телефон</th>
                      <th className="px-3.5 py-2.5 text-left text-[12px] font-semibold text-zinc-500">Тип</th>
                      <th className="px-3.5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const tag  = TAG[c.tag] || TAG.new;
                      const name = clientFullName(c);
                      return (
                        <tr key={c.id} onClick={() => handleRowClick(c.id)}
                          className={`border-b border-zinc-100 cursor-pointer transition-colors hover:bg-zinc-50 ${activeId === c.id ? "bg-blue-50/60" : ""}`}>
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[12px] font-bold shrink-0">{initials(name)}</div>
                              <span className="font-semibold text-zinc-900">{name}</span>
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 text-zinc-500 font-medium">{c.phone}</td>
                          <td className="px-3.5 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${tag.cls}`}>{tag.label}</span>
                          </td>
                          <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setActiveId(c.id); setRightPanel("edit"); }}
                              className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
                              <IconEdit />
                            </button>
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

        {/* right panel — 50% */}
        {showRight && activeClient && (
          <div className="w-1/2 shrink-0 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden sticky top-20 max-h-[calc(100vh-90px)] flex flex-col">
{rightPanel === "detail" && (
  <ClientDetail
    client={activeClient}
    appointments={appointments}
    services={services}
    onClose={() => { setActiveId(null); setRightPanel(null); }}
    onEdit={() => setRightPanel("edit")}
    onBook={(client) => setBookingClient(client)}  // ← добавить
  />
)}
            {rightPanel === "edit" && (
              <EditPanel
                client={activeClient}
                onSave={handleSaveEdit}
                onDelete={handleDelete}
                onClose={() => setRightPanel("detail")}
              />
            )}
          </div>
        )}

        {/* placeholder */}
        {!showRight && (
          <div className="hidden lg:flex w-1/2 shrink-0 items-center justify-center min-h-[300px] border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-[13px] text-center flex-col gap-2">
<div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-1">
  <svg className="w-8 h-8 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
</div>
<div>
  <div className="font-bold text-[15px] text-zinc-600">Карточка клиента</div>
  <div className="text-[12px] text-zinc-400 mt-1">Выберите клиента из списка слева,<br/>чтобы посмотреть детали и историю визитов.</div>
</div>
          </div>
        )}
      </div>
    </div>
  );
}