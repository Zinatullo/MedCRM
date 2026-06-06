
import { useState } from "react"

const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с"
const today = () => new Date().toISOString().slice(0, 10)
const normName = (s) => (s || "").trim().toLowerCase().replace(/ё/g, "е")

const STATUS = {
  pending:   "Не подтверждена",
  confirmed: "Подтверждена",
  arrived:   "Клиент пришёл",
  completed: "Завершена",
  no_show:   "Не пришёл",
  cancelled:  "Отменена",
}

const STAFF_ROLES = {
  cosmetologist: "Косметолог",
  permanent:     "Мастер перманента",
}

function IconSearch() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IconCheck() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconX() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IconPlus() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function IconUser() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
}

function Label({ children }) {
  return <label className="block text-[12px] font-medium text-zinc-500 mb-1">{children}</label>
}
function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full h-9 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${className}`}
    />
  )
}
function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full h-9 px-3 pr-8 text-[13px] border border-zinc-200 rounded-md bg-white appearance-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer ${className}`}
    >
      {children}
    </select>
  )
}

// ── Stage A: Client lookup ────────────────────────────────────────────────────

function ClientLookup({ clients, onFound, onNotFound }) {
  const [form, setForm] = useState({ lastName: "", firstName: "", birthDate: "" })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSearch = () => {
    const ln = normName(form.lastName)
    const fn = normName(form.firstName)
    const bd = form.birthDate.trim()
    if (!ln || !fn || !bd) return

    const found = clients.find(
      c => normName(c.lastName) === ln && normName(c.firstName) === fn && (c.birthDate || "") === bd
    )
    if (found) onFound(found)
    else onNotFound({ lastName: form.lastName.trim(), firstName: form.firstName.trim(), birthDate: bd })
  }

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div className="flex-1 min-w-[130px]">
        <Label>Фамилия *</Label>
        <Input placeholder="Фамилия" value={form.lastName} onChange={set("lastName")} onKeyDown={e => e.key === "Enter" && handleSearch()} />
      </div>
      <div className="flex-1 min-w-[130px]">
        <Label>Имя *</Label>
        <Input placeholder="Имя" value={form.firstName} onChange={set("firstName")} onKeyDown={e => e.key === "Enter" && handleSearch()} />
      </div>
      <div className="min-w-[150px]">
        <Label>Дата рождения *</Label>
        <Input type="date" value={form.birthDate} onChange={set("birthDate")} onKeyDown={e => e.key === "Enter" && handleSearch()} />
      </div>
      <button
        onClick={handleSearch}
        className="h-9 px-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-md transition-colors"
      >
        <IconSearch /><span>Записать</span>
      </button>
    </div>
  )
}

// ── New client draft form ─────────────────────────────────────────────────────

function NewClientDraft({ lastName, firstName, birthDate, onCreate, onCancel }) {
  const [form, setForm] = useState({ phone: "", email: "", tag: "new" })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="mt-3 pt-3 border-t border-blue-200">
      <p className="text-[12.5px] text-zinc-600 mb-2">
        Клиент <b>{firstName} {lastName}</b> ({birthDate}) не найден. Заполните карточку:
      </p>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[160px]">
          <Label>Телефон *</Label>
          <Input type="tel" placeholder="+996 700 000 000" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="flex-1 min-w-[160px]">
          <Label>Email</Label>
          <Input type="email" placeholder="example@mail.com" value={form.email} onChange={set("email")} />
        </div>
        <div className="min-w-[130px]">
          <Label>Тип клиента</Label>
          <Select value={form.tag} onChange={set("tag")}>
            <option value="new">Новый</option>
            <option value="regular">Постоянный</option>
            <option value="vip">VIP</option>
          </Select>
        </div>
        <button
          onClick={() => { if (form.phone.trim()) onCreate({ ...form, lastName, firstName, birthDate }) }}
          className="h-9 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors"
        >
          <IconCheck /><span>Создать и продолжить</span>
        </button>
        <button
          onClick={onCancel}
          className="h-9 px-3 inline-flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[13px] font-medium rounded-md transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  )
}

// ── Visit item row ────────────────────────────────────────────────────────────

function VisitItem({ item, services, staff, onRemove }) {
  const svc = services.find(s => s.id === item.serviceId)
  const st  = staff.find(s => s.id === item.staffId)
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-zinc-900 leading-tight">{svc?.name || "—"}</div>
        <div className="text-[11px] text-zinc-400 mt-0.5">
          {st ? st.name.split(" ")[0] : "—"} · {item.duration} мин
        </div>
      </div>
      <div className="text-[13px] font-semibold text-zinc-900 shrink-0">{fmtMoney(item.price)}</div>
      <button
        onClick={() => onRemove(item.id)}
        className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors shrink-0"
      >
        <IconX />
      </button>
    </div>
  )
}

// ── Service picker ────────────────────────────────────────────────────────────

function ServicePicker({ staffId, services, categories, onAdd }) {
  if (!staffId) return (
    <div className="text-[12.5px] text-zinc-400 text-center py-6">
      Выберите исполнителя, чтобы увидеть его услуги
    </div>
  )

  // filter by staff role
  const [search, setSearch] = useState("")

  const filtered = services
    .filter(s => {
      const q = search.toLowerCase()
      return !q || s.name.toLowerCase().includes(q)
    })

  // group by category
  const grouped = {}
  filtered.forEach(s => {
    const catName = categories.find(c => c.id === s.cat)?.name || s.cat || "Другое"
    if (!grouped[catName]) grouped[catName] = []
    grouped[catName].push(s)
  })

  if (!filtered.length) return (
    <div className="text-[12.5px] text-zinc-400 text-center py-6">Услуг не найдено</div>
  )

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Поиск услуги…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full h-8 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400"
      />
      <div className="max-h-[340px] overflow-y-auto pr-0.5 space-y-3">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1.5">{cat}</div>
            <div className="space-y-1">
              {items.map(s => (
                <button
                  key={s.id}
                  onClick={() => onAdd(s.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-left hover:border-zinc-400 transition-colors"
                >
                  <span className="flex-1 text-[12.5px] font-medium text-zinc-900">{s.name}</span>
                  <span className="text-[11px] text-zinc-400 shrink-0">{fmtMoney(s.price)} · {s.duration} мин</span>
                  <span className="text-zinc-400 shrink-0"><IconPlus /></span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Totals block ─────────────────────────────────────────────────────────────

function Totals({ items, discount, paidCash, paidCard }) {
  const total     = items.reduce((s, i) => s + (Number(i.price) || 0), 0)
  const disc      = Math.max(0, Number(discount) || 0)
  const due       = Math.max(0, total - disc)
  const paid      = Math.max(0, Number(paidCash) || 0) + Math.max(0, Number(paidCard) || 0)
  const remaining = Math.max(0, due - paid)

  return (
    <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1 text-[13px]">
      <div className="flex justify-between"><span className="text-zinc-500">Сумма услуг</span><span className="text-zinc-900">{fmtMoney(total)}</span></div>
      {disc > 0 && <div className="flex justify-between"><span className="text-zinc-500">Скидка</span><span className="text-red-500">−{fmtMoney(disc)}</span></div>}
      <div className="flex justify-between font-semibold"><span>К оплате</span><span>{fmtMoney(due)}</span></div>
      {paid > 0 && <div className="flex justify-between"><span className="text-zinc-500">Оплачено</span><span className="text-zinc-700">{fmtMoney(paid)}</span></div>}
      <div className={`flex justify-between font-bold pt-1 border-t border-zinc-200 ${remaining > 0 ? "text-red-600" : "text-green-600"}`}>
        <span>Остаток</span><span>{fmtMoney(remaining)}</span>
      </div>
    </div>
  )
}

// ── Main VisitBuilder ─────────────────────────────────────────────────────────

/**
 * Props:
 *   clients      — array
 *   services     — array
 *   categories   — array of { id, name }
 *   staff        — array
 *   rooms        — array
 *   onSave       — (visitData) => void
 *   onClientCreate — (clientData) => client  (создаёт клиента и возвращает его)
 */
export default function VisitBuilder({
  clients = [],
  services = [],
  categories = [],
  staff = [],
  rooms = [],
  onSave,
  onClientCreate,
  prefillClient = null,   // ← добавить
}) {
  const initVisit = () => ({
    client:       null,
    newClientMeta: null,   // { lastName, firstName, birthDate } когда не найден
    showDraft:    false,
    items:        [],
    pickerStaffId: "",
    date:         today(),
    time:         "10:00",
    status:       "pending",
    roomId:       "",
    discount:     0,
    paidCash:     0,
    paidCard:     0,
    notes:        "",
  })

  const [v, setV] = useState(() => prefillClient
  ? { ...initVisit(), client: prefillClient }
  : initVisit()
)
  const set = (k) => (val) => setV(f => ({ ...f, [k]: val }))
  const setE = (k) => (e) => setV(f => ({ ...f, [k]: e.target.value }))
  const setNum = (k) => (e) => setV(f => ({ ...f, [k]: Number(e.target.value) || 0 }))

  // performers only
  const performers = staff.filter(
    s => s.active !== false && (s.role === "cosmetologist" || s.role === "permanent")
  )

  // filter services by selected staff role
  const pickerServices = (() => {
    if (!v.pickerStaffId) return []
    const s = staff.find(x => x.id === v.pickerStaffId)
    if (!s) return []
    if (s.role === "permanent") return services.filter(sv => sv.cat === "permanent")
    return services.filter(sv => sv.cat !== "permanent")
  })()

  const handleFound = (client) => {
    setV(f => ({ ...f, client, newClientMeta: null, showDraft: false }))
  }

  const handleNotFound = (meta) => {
    setV(f => ({ ...f, newClientMeta: meta, showDraft: true, client: null }))
  }

  const handleCreateClient = async (data) => {
    const newClient = await onClientCreate?.({
      firstName: data.firstName,
      lastName:  data.lastName,
      birthDate: data.birthDate,
      phone:     data.phone,
      email:     data.email || "",
      tag:       data.tag || "new",
    })
    if (newClient) {
      setV(f => ({ ...f, client: newClient, newClientMeta: null, showDraft: false }))
    }
  }

  const handleAddItem = (serviceId) => {
    if (!v.pickerStaffId) return
    const s = services.find(x => x.id === serviceId)
    if (!s) return
    const newItem = { id: Math.random().toString(36).slice(2), serviceId: s.id, staffId: v.pickerStaffId, price: s.price, duration: s.duration }
    setV(f => ({ ...f, items: [...f.items, newItem] }))
  }

  const handleRemoveItem = (id) => {
    setV(f => ({ ...f, items: f.items.filter(i => i.id !== id) }))
  }

  const handleSave = () => {
    if (!v.client || !v.items.length || !v.date || !v.time) return
    onSave?.({
      clientId:  v.client.id,
      date:      v.date,
      time:      v.time,
      roomId:    v.roomId || null,
      items:     v.items,
      status:    v.status,
      discount:  v.discount,
      paidCash:  v.paidCash,
      paidCard:  v.paidCard,
      notes:     v.notes,
    })
    setV(initVisit())
  }

  const clientName = v.client
    ? `${v.client.firstName || ""} ${v.client.lastName || ""}`.trim() || v.client.name
    : null

  // ── Stage A: lookup ──────────────────────────────────────────────────────

  if (!v.client) {
    return (
      <div className="mb-4 bg-gradient-to-b from-blue-50 to-white border border-blue-200 rounded-xl px-5 py-5 shadow-sm">
        {/* header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <IconUser />
          </div>
          <div>
            <div className="text-[18px] font-bold text-zinc-900 leading-tight">Записать клиента</div>
            <div className="text-[13px] text-zinc-500 mt-0.5">Найдите клиента по Фамилии, Имени и дате рождения, или создайте новую карточку</div>
          </div>
        </div>

        <ClientLookup clients={clients} onFound={handleFound} onNotFound={handleNotFound} />

        {v.showDraft && v.newClientMeta && (
          <NewClientDraft
            {...v.newClientMeta}
            onCreate={handleCreateClient}
            onCancel={() => setV(f => ({ ...f, showDraft: false, newClientMeta: null }))}
          />
        )}
      </div>
    )
  }

  // ── Stage B: visit builder ───────────────────────────────────────────────

  return (
    <div className="mb-4 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      {/* client header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-200 bg-zinc-50">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-0.5">Текущий пациент</div>
          <div className="text-[15px] font-semibold text-zinc-900">
            {clientName}
            <span className="ml-2 text-zinc-400 font-normal text-[13px]">
              {v.client.birthDate && `· ${v.client.birthDate}`}
              {v.client.phone && ` · ${v.client.phone}`}
            </span>
          </div>
        </div>
        <button
          onClick={() => setV(initVisit())}
          className="h-8 px-3 inline-flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 text-[13px] font-medium rounded-md transition-colors shrink-0"
        >
          <IconX /><span>Сбросить</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">
        {/* ── LEFT: form ── */}
        <div className="px-5 py-4 border-r border-zinc-200 space-y-4">

          {/* date / time */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Дата</Label><Input type="date" value={v.date} onChange={setE("date")} /></div>
            <div><Label>Время</Label><Input type="time" value={v.time} onChange={setE("time")} /></div>
          </div>

          {/* services list */}
          <div>
            <Label>Услуги визита</Label>
            {v.items.length === 0 ? (
              <div className="flex items-center justify-center h-12 border border-dashed border-zinc-200 rounded-lg text-[12.5px] text-zinc-400">
                Услуг пока нет — выберите исполнителя справа и добавьте
              </div>
            ) : (
              <div className="space-y-1.5">
                {v.items.map(i => (
                  <VisitItem key={i.id} item={i} services={services} staff={staff} onRemove={handleRemoveItem} />
                ))}
              </div>
            )}
          </div>

          {/* status / room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Статус</Label>
              <Select value={v.status} onChange={setE("status")}>
                {Object.entries(STATUS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Кабинет</Label>
              <Select value={v.roomId} onChange={setE("roomId")}>
                <option value="">— Не выбран —</option>
                {rooms.filter(r => r.active !== false).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* discount */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Скидка (с)</Label>
              <Input type="number" min="0" step="100" value={v.discount} onChange={setNum("discount")} />
            </div>
            <div>
              <Label>Нал (с)</Label>
              <Input type="number" min="0" step="100" value={v.paidCash} onChange={setNum("paidCash")} />
            </div>
            <div>
              <Label>Безнал (с)</Label>
              <Input type="number" min="0" step="100" value={v.paidCard} onChange={setNum("paidCard")} />
            </div>
          </div>

          {/* totals */}
          {v.items.length > 0 && (
            <Totals items={v.items} discount={v.discount} paidCash={v.paidCash} paidCard={v.paidCard} />
          )}

          {/* notes */}
          <div>
            <Label>Заметки</Label>
            <textarea
              value={v.notes}
              onChange={setE("notes")}
              placeholder="Пожелания клиента, аллергии…"
              rows={2}
              className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* save */}
          <div className="pt-1">
            <button
              onClick={handleSave}
              disabled={!v.client || !v.items.length}
              className="h-9 px-5 inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-md transition-colors"
            >
              <IconCheck /><span>Сохранить визит</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-4 bg-zinc-50">
          <div className="mb-3">
            <Label>Исполнитель</Label>
            <Select value={v.pickerStaffId} onChange={setE("pickerStaffId")}>
              <option value="">— Выберите —</option>
              {performers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} · {STAFF_ROLES[s.role] || s.role}
                </option>
              ))}
            </Select>
          </div>

          <ServicePicker
            staffId={v.pickerStaffId}
            services={pickerServices}
            categories={categories}
            onAdd={handleAddItem}
          />
        </div>
      </div>
    </div>
  )
}