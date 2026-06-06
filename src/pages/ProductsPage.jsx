import { useState, useMemo, useEffect } from "react"
import { useAppData } from "../api/useAppData"



const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с"

const PRODUCT_CATS = {
  bio:"Биоревитализация", botox:"Ботулотоксины", filler:"Филлеры",
  peel:"Пилинги", care:"Уходовая косметика", consumable:"Расходники", other:"Другое",
}

const IconX       = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheck   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconEdit    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconTrash   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
const IconSearch  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconChevron = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>

// ── QtyCounter ────────────────────────────────────────────────────────────────

function QtyCounter({ productId, productName, stock, unit, onAdjust }) {
  const handleMinus = (e) => {
    e.stopPropagation()
    onAdjust(productId, e.shiftKey ? -5 : -1)
  }

  const handlePlus = (e) => {
    e.stopPropagation()
    onAdjust(productId, e.shiftKey ? +5 : +1)
  }

  const handleSetManual = (e) => {
    e.stopPropagation()
    const val = prompt(`Изменить остаток для "${productName}"`, stock)
    if (val !== null) {
      const newStock = Number(val)
      if (!isNaN(newStock) && newStock >= 0) {
        onAdjust(productId, newStock - stock)
      }
    }
  }

  return (
    <div className="qty-stepper inline-flex items-stretch border border-zinc-300 rounded-md overflow-hidden" title="Кликните по числу для ввода вручную; Shift+клик для ±5">
      <button type="button" className="minus w-8 flex items-center justify-center bg-white hover:bg-red-50 text-red-600 hover:text-red-700 text-[18px] font-bold transition-colors border-r border-zinc-300"
        onClick={handleMinus} title="Списать">−</button>
      <button type="button" className="qty-num min-w-[5ch] px-3 flex items-center justify-center bg-white hover:bg-blue-50 text-zinc-900 font-bold text-[15px] cursor-pointer transition-colors"
        onClick={handleSetManual} title="Изменить вручную">
        {stock}<span className="qty-unit text-zinc-500 font-semibold text-[12px] ml-1">{unit || "шт."}</span>
      </button>
      <button type="button" className="plus w-8 flex items-center justify-center bg-white hover:bg-green-50 text-green-600 hover:text-green-700 text-[18px] font-bold transition-colors border-l border-zinc-300"
        onClick={handlePlus} title="Принять">+</button>
    </div>
  )
}

// ── ProductDetailModal ────────────────────────────────────────────────────────

function ProductDetailModal({ product, onClose, onEdit, onDelete, onAdjust }) {
  const [confirm, setConfirm] = useState(false)
  const [busy,    setBusy]    = useState(false)
  const stock    = Number(product.stock) || 0
  const minStock = Number(product.minStock) || 0

  const stockLabel = stock === 0 ? "Нет в наличии" : stock <= minStock ? "Заканчивается" : "В наличии"
  const stockCls   = stock === 0 ? "bg-red-100 text-red-700" : stock <= minStock ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
  const catName    = PRODUCT_CATS[product.cat] || product.cat || "—"

  const handleDelete = async () => {
    setBusy(true)
    try { await onDelete(product.id); onClose() }
    catch(e) { setBusy(false) }
  }

  if (confirm) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-[360px] p-6" onClick={e=>e.stopPropagation()}>
        <div className="text-[16px] font-bold text-zinc-900 mb-2">Удалить товар?</div>
        <div className="text-[13px] text-zinc-500 mb-5">«{product.name}» будет удалён без возможности восстановления.</div>
        <div className="flex gap-2">
          <button onClick={()=>setConfirm(false)} className="flex-1 h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[14px] font-medium rounded-lg transition-colors">Отмена</button>
          <button onClick={handleDelete} disabled={busy} className="flex-1 h-10 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-[14px] font-semibold rounded-lg transition-colors">
            {busy ? "Удаление…" : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px]" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="text-[16px] font-bold text-zinc-900">{product.name}</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md text-[12px] font-medium">{catName}</span>
            <span className={`px-2.5 py-1 rounded-md text-[12px] font-medium ${stockCls}`}>{stockLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">На складе</div>
              <div className="text-[15px] font-bold text-zinc-900">{stock} {product.unit || "шт."}</div>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">Минимум</div>
              <div className="text-[15px] font-bold text-zinc-900">{minStock} {product.unit || "шт."}</div>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">Цена закупки</div>
              <div className="text-[15px] font-bold text-zinc-900">{fmtMoney(product.price)}</div>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">Поставщик</div>
              <div className="text-[15px] font-bold text-zinc-900">{product.supplier || "—"}</div>
            </div>
          </div>
          <div>
            <div className="text-[12px] font-medium text-zinc-700 mb-2">Изменить остаток</div>
            <div className="flex gap-2 flex-wrap">
              {[-10, -1, +1, +5, +10].map(d => (
                <button key={d} onClick={()=>onAdjust(product.id, d)}
                  className={`h-9 px-4 rounded-lg text-[13px] font-semibold border transition-colors ${d < 0 ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"}`}>
                  {d > 0 ? `+${d}` : d}
                </button>
              ))}
            </div>
          </div>
          {product.description && (
            <div className="text-[12.5px] text-zinc-500 leading-snug">{product.description}</div>
          )}
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-zinc-100">
          <button onClick={()=>setConfirm(true)}
            className="h-9 px-3 inline-flex items-center gap-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[13px] font-medium rounded-lg transition-colors">
            <IconTrash />Удалить
          </button>
          <button onClick={onClose} className="flex-1 h-9 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[13px] font-medium rounded-lg transition-colors">Закрыть</button>
          <button onClick={()=>{ onClose(); onEdit(product) }}
            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-semibold rounded-lg transition-colors">
            <IconEdit />Редактировать
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ProductEditModal ──────────────────────────────────────────────────────────

function ProductEditModal({ product, onSave, onClose }) {
  const isEdit = !!product
  const catOpts = Object.entries(PRODUCT_CATS).map(([id,name])=>({id,name}))

  const [form, setForm] = useState({
    name:        product?.name        || "",
    cat:         product?.cat         || "other",
    supplier:    product?.supplier    || "",
    price:       product?.price       || 0,
    stock:       product?.stock       || 0,
    minStock:    product?.minStock    || 1,
    unit:        product?.unit        || "шт.",
    description: product?.description || "",
  })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState(null)

  const set    = (k) => (e) => setForm(f=>({...f,[k]:e.target.value}))
  const setNum = (k) => (e) => setForm(f=>({...f,[k]:Number(e.target.value)||0}))
  const inp = "w-full h-10 px-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
  const sel = "w-full h-10 px-3 pr-8 text-[13px] border border-zinc-200 rounded-lg bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer"
  const lbl = "block text-[13px] font-medium text-zinc-700 mb-1.5"

  const handleSave = async () => {
    if (!form.name.trim()) { setErr("Введите название"); return }
    setBusy(true); setErr(null)
    try {
      await onSave({ name:form.name.trim(), cat:form.cat, supplier:form.supplier.trim(), price:Number(form.price), stock:Number(form.stock), minStock:Number(form.minStock), unit:form.unit.trim()||"шт.", description:form.description.trim() })
      onClose()
    } catch(e) { setErr(e.message||"Ошибка сохранения") } finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 rounded-t-2xl shrink-0">
          <div className="text-[16px] font-bold text-zinc-900">{isEdit ? "Редактировать товар" : "Новый товар"}</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div><label className={lbl}>Название *</label><input placeholder="Название товара" value={form.name} onChange={set("name")} className={inp} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Категория</label>
              <select value={form.cat} onChange={set("cat")} className={sel}>
                {catOpts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Поставщик</label><input value={form.supplier} onChange={set("supplier")} className={inp} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Цена закупки (с)</label><input type="number" min="0" step="50" value={form.price} onChange={setNum("price")} className={inp} /></div>
            <div><label className={lbl}>Единица</label><input placeholder="шт." value={form.unit} onChange={set("unit")} className={inp} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>На складе</label><input type="number" min="0" value={form.stock} onChange={setNum("stock")} className={inp} /></div>
            <div><label className={lbl}>Минимальный остаток</label><input type="number" min="0" value={form.minStock} onChange={setNum("minStock")} className={inp} /></div>
          </div>
          <div><label className={lbl}>Описание</label>
            <textarea value={form.description} onChange={set("description")} rows={3}
              className="w-full px-3 py-2.5 text-[13px] border border-zinc-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          {err && <div className="text-[12px] text-red-500">{err}</div>}
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 rounded-b-2xl shrink-0 flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[14px] font-medium rounded-lg transition-colors">Отмена</button>
          <button onClick={handleSave} disabled={busy}
            className="flex-1 h-10 inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400 text-white text-[14px] font-semibold rounded-lg transition-colors">
            <IconCheck /><span>{busy?"Сохранение…":"Сохранить"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function stockStatus(stock, minStock) {
  if (stock === 0)       return { dot:"bg-red-500",   left:"border-l-red-400"   }
  if (stock <= minStock) return { dot:"bg-amber-400", left:"border-l-amber-400" }
  return                        { dot:"bg-green-500", left:"border-l-green-400" }
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { data, loading, error, api } = useAppData()
  const { products } = data

  const [filter,     setFilter]     = useState({ search:"", cat:"all", lowOnly:false })
  const [detailProd, setDetailProd] = useState(null)
  const [editProd,   setEditProd]   = useState(null)

  useEffect(() => {
    const handler = () => setEditProd("new")
    window.addEventListener("open-new-product", handler)
    return () => window.removeEventListener("open-new-product", handler)
  }, [])

  const stats = useMemo(()=>({
    total: products.length,
    value: products.reduce((s,p)=>s+(Number(p.price)||0)*(Number(p.stock)||0),0),
    low:   products.filter(p=>p.stock>0&&p.stock<=p.minStock).length,
    out:   products.filter(p=>p.stock===0).length,
  }),[products])

  const filtered = useMemo(()=>{
    let list=[...products]
    if(filter.cat!=="all")  list=list.filter(p=>p.cat===filter.cat)
    if(filter.lowOnly)      list=list.filter(p=>p.stock<=p.minStock)
    if(filter.search.trim()){
      const q=filter.search.toLowerCase()
      list=list.filter(p=>p.name.toLowerCase().includes(q)||(p.supplier||"").toLowerCase().includes(q))
    }
    return list.sort((a,b)=>{
      const ac=a.stock===0?0:a.stock<=a.minStock?1:2
      const bc=b.stock===0?0:b.stock<=b.minStock?1:2
      if(ac!==bc) return ac-bc
      return a.name.localeCompare(b.name,"ru")
    })
  },[products,filter])

  const handleSave = async (formData) => {
    if (editProd && editProd !== "new") {
      await api.updateProduct(editProd.id, formData)
    } else {
      await api.createProduct(formData)
    }
  }

  const getLatest = (p) => products.find(x=>x.id===p?.id) || p

  if(loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>
  if(error)   return <div className="text-red-500 p-4">{error}</div>

  return (
    <div className="flex flex-col gap-4">
      {detailProd && (
        <ProductDetailModal
          product={getLatest(detailProd)}
          onClose={()=>setDetailProd(null)}
          onEdit={(p)=>setEditProd(p)}
          onDelete={api.deleteProduct}
          onAdjust={api.adjustProductStock}
        />
      )}
      {editProd && (
        <ProductEditModal
          product={editProd !== "new" ? editProd : null}
          onSave={handleSave}
          onClose={()=>setEditProd(null)}
        />
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Всего товаров",    value:stats.total,           color:"text-zinc-900" },
          { label:"Стоимость склада", value:fmtMoney(stats.value), color:"text-zinc-900" },
          { label:"Заканчиваются",    value:stats.low,             color:stats.low>0?"text-amber-600":"text-zinc-900" },
          { label:"Нет в наличии",    value:stats.out,             color:stats.out>0?"text-red-600":"text-zinc-900" },
        ].map((b,i)=>(
          <div key={i} className="bg-white border border-zinc-200 rounded-lg px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-1">{b.label}</div>
            <div className={`text-[20px] font-bold leading-none ${b.color}`}>{b.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-blue-50/40 border-b border-zinc-200">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-45 max-w-70">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"><IconSearch /></span>
              <input type="text" placeholder="Поиск по названию или поставщику"
                value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}
                className="w-full h-8 pl-8 pr-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
            </div>
            <div className="relative">
              <select value={filter.cat} onChange={e=>setFilter(f=>({...f,cat:e.target.value}))}
                className="h-8 px-2.5 pr-7 text-[13px] border border-zinc-200 rounded-md bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
                <option value="all">Все категории</option>
                {Object.entries(PRODUCT_CATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"><IconChevron /></span>
            </div>
            <button onClick={()=>setFilter(f=>({...f,lowOnly:!f.lowOnly}))}
              className={`h-8 px-3 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-md border transition-colors ${filter.lowOnly?"bg-zinc-900 text-white border-zinc-900":"bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"}`}>
              Только заканчивающиеся
            </button>
          </div>
        </div>

        {filtered.length===0 ? (
          <div className="py-14 text-center text-zinc-400 text-[13px]">Товаров не найдено</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-3.5 py-2.5 w-4"/>
                  <th className="px-3.5 py-2.5 text-left text-[13px] font-semibold text-zinc-600">Товар</th>
                  <th className="px-3.5 py-2.5 text-left text-[13px] font-semibold text-zinc-600">Категория</th>
                  <th className="px-3.5 py-2.5 text-left text-[13px] font-semibold text-zinc-600">Поставщик</th>
                  <th className="px-3.5 py-2.5 text-right text-[13px] font-semibold text-zinc-600">Остаток</th>
                  <th className="px-3.5 py-2.5 text-right text-[13px] font-semibold text-zinc-600">Мин</th>
                  <th className="px-3.5 py-2.5 text-right text-[13px] font-semibold text-zinc-600">Цена</th>
                  <th className="px-3.5 py-2.5 text-right text-[13px] font-semibold text-zinc-600">Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p=>{
                  const stock=Number(p.stock)||0
                  const minStock=Number(p.minStock)||0
                  const st=stockStatus(stock,minStock)
                  return (
                    <tr key={p.id} onClick={()=>setDetailProd(p)}
                      className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-50 cursor-pointer border-l-4 ${st.left}`}>
                      <td className="px-3.5 py-3"><span className={`inline-block w-2 h-2 rounded-full ${st.dot}`}/></td>
                      <td className="px-3.5 py-3 font-bold text-zinc-900 text-[14px]">{p.name}</td>
                      <td className="px-3.5 py-3 text-zinc-600 text-[14px]">{PRODUCT_CATS[p.cat]||p.cat}</td>
                      <td className="px-3.5 py-3 text-zinc-600 text-[14px]">{p.supplier||"—"}</td>
                      <td className="px-3.5 py-3 text-right" onClick={e=>e.stopPropagation()}>
  <div className="flex justify-end">
    <QtyCounter productId={p.id} productName={p.name} stock={stock} unit={p.unit} onAdjust={api.adjustProductStock} />
  </div>
</td>
                      <td className="px-3.5 py-3 text-right text-zinc-600 text-[14px] font-medium">{minStock}</td>
                      <td className="px-3.5 py-3 text-right font-bold text-zinc-900 text-[14px]">{fmtMoney(p.price)}</td>
                      <td className="px-3.5 py-3 text-right text-zinc-600 text-[14px] font-medium">{fmtMoney(stock*(Number(p.price)||0))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}