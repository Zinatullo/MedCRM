import { useState, useMemo, useEffect } from "react"
import { useAppData } from "../api/useAppData"

const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с"

const SVC_CATS = {
  bio:"Биоревитализация", botox:"Ботулотоксины", filler:"Филлеры",
  peel:"Пилинги", care:"Уходовая косметика", permanent:"Перманентный макияж", other:"Другое",
}
const IconSearch = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconChevron = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconX     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheck = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconEdit  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconTrash = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>

function ServiceModal({ service, categories, onSave, onDelete, onClose }) {
  const isEdit = !!service
  const [confirm, setConfirm] = useState(service?._confirmDelete || false)
  const catOptions = categories.length > 0
    ? categories.map(c => ({ id: c.id, name: c.name }))
    : Object.entries(SVC_CATS).map(([id, name]) => ({ id, name }))

  const [form, setForm] = useState({
    name:        service?.name        || "",
    cat:         service?.cat         || catOptions[0]?.id || "other",
    duration:    service?.duration    || 45,
    price:       service?.price       || 0,
    description: service?.description || "",
  })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState(null)

  const set    = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setNum = (k) => (e) => setForm(f => ({ ...f, [k]: Number(e.target.value) || 0 }))
  const inp = "w-full h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
  const sel = "w-full h-10 px-3 pr-8 text-[13px] border border-zinc-200 rounded-lg bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer"
  const lbl = "block text-[13px] font-medium text-zinc-700 mb-1.5"

  const handleSave = async () => {
    if (!form.name.trim()) { setErr("Введите название"); return }
    setBusy(true); setErr(null)
    try {
      await onSave({ name: form.name.trim(), cat: form.cat, duration: Number(form.duration), price: Number(form.price), description: form.description.trim() })
      onClose()
    } catch(e) { setErr(e.message || "Ошибка сохранения") } finally { setBusy(false) }
  }

  const handleDelete = async () => {
    setBusy(true)
    try { await onDelete(service.id); onClose() }
    catch(e) { setErr(e.message || "Ошибка удаления") } finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {confirm && (
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-[360px] p-6" onClick={e=>e.stopPropagation()}>
          <div className="text-[16px] font-bold text-zinc-900 mb-2">Удалить услугу?</div>
          <div className="text-[13px] text-zinc-500 mb-5">«{service.name}» будет удалена без возможности восстановления.</div>
          <div className="flex gap-2">
            <button onClick={()=>setConfirm(false)} className="flex-1 h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[14px] font-medium rounded-lg transition-colors">Отмена</button>
            <button onClick={handleDelete} disabled={busy} className="flex-1 h-10 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-[14px] font-semibold rounded-lg transition-colors">
              {busy ? "Удаление…" : "Удалить"}
            </button>
          </div>
        </div>
      )}

      {!confirm && (
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 rounded-t-2xl shrink-0">
            <div className="text-[16px] font-bold text-zinc-900">{isEdit ? "Редактировать услугу" : "Новая услуга"}</div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
          </div>
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            <div><label className={lbl}>Название *</label><input placeholder="Название услуги" value={form.name} onChange={set("name")} className={inp} /></div>
            <div><label className={lbl}>Категория</label>
              <select value={form.cat} onChange={set("cat")} className={sel}>
                {catOptions.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Длительность (мин) *</label><input type="number" min="5" step="5" value={form.duration} onChange={setNum("duration")} className={inp} /></div>
              <div><label className={lbl}>Цена (с) *</label><input type="number" min="0" step="100" value={form.price} onChange={setNum("price")} className={inp} /></div>
            </div>
            <div><label className={lbl}>Описание</label>
              <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Краткое описание услуги"
                className="w-full px-3 py-2.5 text-[13px] border border-zinc-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            {err && <div className="text-[12px] text-red-500">{err}</div>}
          </div>
          <div className="px-5 py-4 border-t border-zinc-100 rounded-b-2xl shrink-0 flex gap-2">
            {isEdit && (
              <button onClick={()=>setConfirm(true)}
                className="h-10 px-3 inline-flex items-center gap-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[13px] font-medium rounded-lg transition-colors">
                <IconTrash />Удалить
              </button>
            )}
            <button onClick={onClose} className="flex-1 h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[14px] font-medium rounded-lg transition-colors">Отмена</button>
            <button onClick={handleSave} disabled={busy}
              className="flex-1 h-10 inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400 text-white text-[14px] font-semibold rounded-lg transition-colors">
              <IconCheck /><span>{busy ? "Сохранение…" : "Сохранить"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ServicesPage() {
  const { data, loading, error, api } = useAppData()
  const { services, serviceCategories: categories } = data

  const [tab,        setTab]        = useState("list")
  const [filter,     setFilter]     = useState({ search:"", cat:"all" })
  const [newCatName, setNewCatName] = useState("")
  const [modal,      setModal]      = useState(null)

  useEffect(() => {
    const handler = () => setModal("new")
    window.addEventListener("open-new-service", handler)
    return () => window.removeEventListener("open-new-service", handler)
  }, [])

  const getCatName = (id) => categories.find(c=>c.id===id)?.name || SVC_CATS[id] || id || "—"

  const filtered = useMemo(()=>{
    let list=[...services]
    if(filter.cat!=="all") list=list.filter(s=>s.cat===filter.cat)
    if(filter.search.trim()){
      const q=filter.search.toLowerCase()
      list=list.filter(s=>s.name.toLowerCase().includes(q))
    }
    return list.sort((a,b)=>a.name.localeCompare(b.name,"ru"))
  },[services,filter])

  const catCounts = useMemo(()=>{
    const m={}
    services.forEach(s=>{ m[s.cat]=(m[s.cat]||0)+1 })
    return m
  },[services])

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    await api.createServiceCategory({ id: newCatName.trim().toLowerCase().replace(/\s+/g,"_"), name: newCatName.trim() })
    setNewCatName("")
  }

  const handleSaveService = async (formData) => {
    if (modal && modal !== "new") {
      await api.updateService(modal.id, formData)
    } else {
      await api.createService(formData)
    }
  }

  if(loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>
  if(error)   return <div className="text-red-500 p-4">{error}</div>

  return (
    <div className="flex flex-col gap-4">
      {modal && (
        <ServiceModal
          service={modal !== "new" ? modal : null}
          categories={categories}
          onSave={handleSaveService}
          onDelete={api.deleteService}
          onClose={()=>setModal(null)}
        />
      )}

      <div className="flex bg-zinc-100 p-0.5 rounded-lg w-fit">
        {[["list","Услуги"],["categories","Категории"]].map(([k,v])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${tab===k?"bg-white text-blue-600 shadow-sm":"text-zinc-500 hover:text-zinc-900"}`}>
            {v}
          </button>
        ))}
      </div>

      {tab==="list" && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-blue-50/40 border-b border-zinc-200">
            <div className="flex flex-wrap gap-2 items-center">
<div className="relative flex-1 min-w-45 max-w-70">
  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
    <IconSearch />
  </span>
  <input type="text" placeholder="Поиск услуги"
    value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}
    className="w-full h-8 pl-8 pr-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
</div>
<div className="relative">
  <select value={filter.cat} onChange={e=>setFilter(f=>({...f,cat:e.target.value}))}
    className="h-8 px-2.5 pr-7 text-[13px] border border-zinc-200 rounded-md bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
    <option value="all">Все</option>
    {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
  </select>
  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
    <IconChevron />
  </span>
</div>
            </div>
          </div>
          {filtered.length===0 ? (
            <div className="py-14 text-center text-zinc-400 text-[13px]">Услуг не найдено</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Услуга</th>
                    <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Категория</th>
                    <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Длительность</th>
                    <th className="px-3.5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Цена</th>
                    <th className="px-3.5 py-2.5"/>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s=>(
                    <tr key={s.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                      <td className="px-3.5 py-2.5 font-medium text-zinc-900">{s.name}</td>
                      <td className="px-3.5 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[11px] font-medium">{getCatName(s.cat)}</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-zinc-500">{s.duration} мин</td>
                      <td className="px-3.5 py-2.5 text-right font-semibold text-zinc-900">{fmtMoney(s.price)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={()=>setModal(s)}
                            className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
                            <IconEdit />
                          </button>
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Удалить"
                            onClick={e=>{ e.stopPropagation(); setModal({...s, _confirmDelete: true}) }}>
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab==="categories" && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-blue-50/40 border-b border-zinc-200">
            <div className="flex gap-2 items-center">
              <input type="text" placeholder="Название новой категории"
                value={newCatName} onChange={e=>setNewCatName(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") handleAddCategory() }}
                className="flex-1 h-8 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
              <button onClick={handleAddCategory}
                className="h-8 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors">
                + Добавить
              </button>
            </div>
          </div>
          {categories.length===0 ? (
            <div className="py-14 text-center text-zinc-400 text-[13px]">Категорий нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Название</th>
                    <th className="px-3.5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Услуг</th>
                    <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">ID</th>
                    <th className="px-3.5 py-2.5"/>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c=>(
                    <tr key={c.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                      <td className="px-3.5 py-2 font-medium text-zinc-900">{c.name}</td>
                      <td className="px-3.5 py-2 text-right text-zinc-500">{catCounts[c.id]||0}</td>
                      <td className="px-3.5 py-2 text-zinc-400 font-mono text-[11px]">{c.id}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={()=>api.deleteServiceCategory(c.id)}
                          className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors ml-auto">
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}