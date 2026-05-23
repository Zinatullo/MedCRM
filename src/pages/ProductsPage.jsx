import { useState, useMemo } from "react"
import { useAppData } from "../api/useAppData"

const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с"

const PRODUCT_CATS = {
  bio:"Биоревитализация", botox:"Ботулотоксины", filler:"Филлеры",
  peel:"Пилинги", care:"Уходовая косметика", consumable:"Расходники", other:"Другое",
}

const IconX_P     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheck_P = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

function NewProductModal({ categories = [], onSave, onClose }) {
  const [form, setForm] = useState({ name:"", cat:"other", supplier:"", price:0, stock:0, minStock:1, unit:"шт.", description:"" })
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
      await onSave({ name: form.name.trim(), cat: form.cat, supplier: form.supplier.trim(), price: Number(form.price), stock: Number(form.stock), minStock: Number(form.minStock), unit: form.unit.trim() || "шт.", description: form.description.trim() })
      onClose()
    } catch(e) { setErr(e.message || "Ошибка сохранения") } finally { setBusy(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 rounded-t-2xl shrink-0">
          <div className="text-[16px] font-bold text-zinc-900">Новый товар</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"><IconX_P /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div><label className={lbl}>Название *</label><input placeholder="Название товара" value={form.name} onChange={set("name")} className={inp} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Категория</label>
              <select value={form.cat} onChange={set("cat")} className={sel}>
                {(categories.length > 0 ? categories : Object.entries(PRODUCT_CATS).map(([id,name])=>({id,name}))).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Поставщик</label><input placeholder="" value={form.supplier} onChange={set("supplier")} className={inp} /></div>
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
            <textarea value={form.description} onChange={set("description")} rows={3} placeholder=""
              className="w-full px-3 py-2.5 text-[13px] border border-zinc-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          {err && <div className="text-[12px] text-red-500">{err}</div>}
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 rounded-b-2xl shrink-0 flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[14px] font-medium rounded-lg transition-colors">Отмена</button>
          <button onClick={handleSave} disabled={busy}
            className="flex-1 h-10 inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-400 text-white text-[14px] font-semibold rounded-lg transition-colors">
            <IconCheck_P /><span>{busy ? "Сохранение…" : "Сохранить"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с"

const PRODUCT_CATS = {
  bio:        "Биоревитализация",
  botox:      "Ботулотоксины",
  filler:     "Филлеры",
  peel:       "Пилинги",
  care:       "Уходовая косметика",
  consumable: "Расходники",
  other:      "Другое",
}

function stockStatus(stock, minStock) {
  if (stock === 0)       return { label:"Нет",  cls:"text-red-600",   dot:"bg-red-500",   bar:"bg-red-500",   left:"border-l-red-400"   }
  if (stock <= minStock) return { label:"Мало", cls:"text-amber-600", dot:"bg-amber-400", bar:"bg-amber-400", left:"border-l-amber-400" }
  return                        { label:"OK",   cls:"text-green-600", dot:"bg-green-500", bar:"bg-green-500", left:"border-l-green-400" }
}

function QtyStepper({ product, onAdjust }) {
  const stock = Number(product.stock) || 0
  return (
    <div className="inline-flex items-stretch border border-zinc-200 rounded-md overflow-hidden bg-white h-8">
      <button disabled={stock<=0} onClick={(e)=>{e.stopPropagation();onAdjust(product.id,e.shiftKey?-5:-1)}}
        className="w-8 flex items-center justify-center text-[18px] font-semibold text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">−</button>
      <div className="min-w-14 flex items-center justify-center gap-1 text-[14px] font-bold text-zinc-900 border-x border-zinc-200">
        {stock}<span className="text-[10px] font-medium text-zinc-400">{product.unit||""}</span>
      </div>
      <button onClick={(e)=>{e.stopPropagation();onAdjust(product.id,e.shiftKey?5:1)}}
        className="w-8 flex items-center justify-center text-[18px] font-semibold text-green-600 hover:bg-green-50 transition-colors">+</button>
    </div>
  )
}

export default function ProductsPage() {
  const { data, loading, error, api } = useAppData()
  const { products, productCategories } = data

  const [filter, setFilter] = useState({ search:"", cat:"all", lowOnly:false })
  const [showModal, setShowModal] = useState(false)

  const stats = useMemo(()=>({
    total:   products.length,
    value:   products.reduce((s,p)=>s+(Number(p.price)||0)*(Number(p.stock)||0),0),
    low:     products.filter(p=>p.stock>0&&p.stock<=p.minStock).length,
    out:     products.filter(p=>p.stock===0).length,
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

  if(loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>
  if(error)   return <div className="text-red-500 p-4">{error}</div>

  return (
    <div className="flex flex-col gap-4">
      {showModal && <NewProductModal categories={productCategories} onSave={api.createProduct} onClose={() => setShowModal(false)} />}
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
              <input type="text" placeholder="Поиск по названию или поставщику"
                value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}
                className="w-full h-8 pl-8 pr-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
            </div>
            <select value={filter.cat} onChange={e=>setFilter(f=>({...f,cat:e.target.value}))}
              className="h-8 px-2.5 pr-7 text-[13px] border border-zinc-200 rounded-md bg-white appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
              <option value="all">Все категории</option>
              {Object.entries(PRODUCT_CATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={()=>setFilter(f=>({...f,lowOnly:!f.lowOnly}))}
              className={`h-8 px-3 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-md border transition-colors ${filter.lowOnly?"bg-zinc-900 text-white border-zinc-900":"bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"}`}>
              Заканчивающиеся
            </button>
            <button onClick={() => setShowModal(true)} className="ml-auto h-8 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors">
              + Новый товар
            </button>
          </div>
        </div>

        {filtered.length===0 ? (
          <div className="py-14 text-center text-zinc-400 text-[13px]">Товаров не найдено</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-3.5 py-2.5 w-4"/>
                  <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Товар</th>
                  <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Категория</th>
                  <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Поставщик</th>
                  <th className="px-3.5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Остаток</th>
                  <th className="px-3.5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Мин</th>
                  <th className="px-3.5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Цена</th>
                  <th className="px-3.5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Стоимость</th>
                  <th className="px-3.5 py-2.5"/>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p=>{
                  const stock=Number(p.stock)||0
                  const minStock=Number(p.minStock)||0
                  const st=stockStatus(stock,minStock)
                  return (
                    <tr key={p.id} className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-50 cursor-pointer border-l-4 ${st.left}`}>
                      <td className="px-3.5 py-3"><span className={`inline-block w-2 h-2 rounded-full ${st.dot}`}/></td>
                      <td className="px-3.5 py-3"><div className="font-semibold text-zinc-900 leading-tight">{p.name}</div></td>
                      <td className="px-3.5 py-3 text-zinc-500">{PRODUCT_CATS[p.cat]||p.cat}</td>
                      <td className="px-3.5 py-3 text-zinc-500">{p.supplier||"—"}</td>
                      <td className="px-3.5 py-3 text-right" onClick={e=>e.stopPropagation()}>
                        <QtyStepper product={p} onAdjust={api.adjustProductStock}/>
                      </td>
                      <td className="px-3.5 py-3 text-right text-zinc-500">{minStock}</td>
                      <td className="px-3.5 py-3 text-right font-semibold text-zinc-900">{fmtMoney(p.price)}</td>
                      <td className="px-3.5 py-3 text-right text-zinc-500">{fmtMoney(stock*(Number(p.price)||0))}</td>
                      <td className="px-3 py-3" onClick={e=>e.stopPropagation()}>
                        <button className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors ml-auto">✎</button>
                      </td>
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