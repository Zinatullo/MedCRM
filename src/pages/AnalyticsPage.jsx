import { useState, useMemo } from "react"
import { useAppData } from "../api/useAppData"

const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(n) + " с"
const today = () => new Date().toISOString().slice(0, 10)
const addDays = (d, n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10) }
const visitItems     = (a) => a.items||[]
const visitDue       = (a) => Math.max(0, visitItems(a).reduce((s,i)=>s+(Number(i.price)||0),0) - Math.max(0,Number(a.discount)||0))
const visitPaid      = (a) => Math.max(0,Number(a.paidCash)||0)+Math.max(0,Number(a.paidCard)||0)
const visitRemaining = (a) => Math.max(0, visitDue(a)-visitPaid(a))

function BarRow({ label, value, max, money }) {
  const pct = max>0 ? Math.max(2, Math.round((value/max)*100)) : 0
  return (
    <div className="mb-2.5">
      <div className="text-[12px] text-zinc-700 mb-1 truncate">{label}</div>
      <div className="grid grid-cols-[1fr_80px] gap-2 items-center">
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-blue-600 to-blue-400 rounded-full transition-all" style={{width:`${pct}%`}}/>
        </div>
        <div className="text-[12px] font-semibold text-zinc-900 text-right whitespace-nowrap">
          {money ? fmtMoney(value) : value}
        </div>
      </div>
    </div>
  )
}

function AnalyticsCard({ title, children, empty }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
      <div className="text-[13px] font-semibold text-zinc-900 mb-3">{title}</div>
      {empty ? <div className="text-[12px] text-zinc-400 text-center py-6">Нет данных</div> : children}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data, loading, error } = useAppData()
  const { appointments, clients, services, staff } = data

  const [period, setPeriod] = useState("30")

  const todayStr = today()
  const from = period==="7"?addDays(todayStr,-6):period==="30"?addDays(todayStr,-29):period==="90"?addDays(todayStr,-89):null
  const inRange = (a) => from ? (a.date>=from && a.date<=todayStr) : true

  const { visits, completed, cancelled, noShow, revenue, avgTicket, cashSum, cardSum, remainingDebt, completionRate, noShowRate, topServices, topStaff, topClients } = useMemo(()=>{
    const visits    = appointments.filter(inRange)
    const completed = visits.filter(a=>a.status==="completed")
    const cancelled = visits.filter(a=>a.status==="cancelled")
    const noShow    = visits.filter(a=>a.status==="no_show")
    let revenue=0, cashSum=0, cardSum=0, remainingDebt=0
    completed.forEach(a=>{ revenue+=visitDue(a); cashSum+=Math.max(0,Number(a.paidCash)||0); cardSum+=Math.max(0,Number(a.paidCard)||0) })
    visits.filter(a=>a.status!=="cancelled"&&a.status!=="no_show").forEach(a=>{ remainingDebt+=visitRemaining(a) })
    const avgTicket      = completed.length ? Math.round(revenue/completed.length) : 0
    const completionRate = visits.length ? Math.round((completed.length/visits.length)*100) : 0
    const noShowRate     = visits.length ? Math.round((noShow.length/visits.length)*100) : 0
    const svcMap={}
    completed.forEach(a=>visitItems(a).forEach(i=>{
      if(!svcMap[i.serviceId]) svcMap[i.serviceId]={count:0,revenue:0}
      svcMap[i.serviceId].count++; svcMap[i.serviceId].revenue+=Number(i.price)||0
    }))
    const topServices=Object.entries(svcMap).sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,6)
      .map(([id,s])=>({name:services.find(x=>x.id===id)?.name||"—",...s}))
    const staffMap={}
    completed.forEach(a=>visitItems(a).forEach(i=>{
      if(!i.staffId) return
      if(!staffMap[i.staffId]) staffMap[i.staffId]={count:0,revenue:0}
      staffMap[i.staffId].count++; staffMap[i.staffId].revenue+=Number(i.price)||0
    }))
    const topStaff=Object.entries(staffMap).sort((a,b)=>b[1].revenue-a[1].revenue)
      .map(([id,s])=>({name:staff.find(x=>x.id===id)?.name||"—",...s}))
    const clientMap={}
    completed.forEach(a=>{
      if(!clientMap[a.clientId]) clientMap[a.clientId]={count:0,revenue:0}
      clientMap[a.clientId].count++; clientMap[a.clientId].revenue+=visitDue(a)
    })
    const topClients=Object.entries(clientMap).sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,6)
      .map(([id,s])=>{
        const c=clients.find(x=>x.id===id)
        return {name:c?`${c.firstName||""} ${c.lastName||""}`.trim()||c.name||"—":"—",...s}
      })
    return {visits,completed,cancelled,noShow,revenue,avgTicket,cashSum,cardSum,remainingDebt,completionRate,noShowRate,topServices,topStaff,topClients}
  // eslint-disable-next-line
  },[appointments,clients,services,staff,period])

  const PERIODS=[["7","За 7 дней"],["30","За 30 дней"],["90","За 90 дней"],["all","За всё время"]]
  const maxSvcRev    = Math.max(1,...topServices.map(s=>s.revenue))
  const maxStaffRev  = Math.max(1,...topStaff.map(s=>s.revenue))
  const maxClientRev = Math.max(1,...topClients.map(s=>s.revenue))

  if(loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Загрузка…</div>
  if(error)   return <div className="text-red-500 p-4">{error}</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex bg-zinc-100 p-0.5 rounded-lg w-fit">
        {PERIODS.map(([k,v])=>(
          <button key={k} onClick={()=>setPeriod(k)}
            className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${period===k?"bg-white text-blue-600 shadow-sm":"text-zinc-500 hover:text-zinc-900"}`}>
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label:"Выручка",     value:fmtMoney(revenue),   sub:`${completed.length} завершённых` },
          { label:"Средний чек", value:fmtMoney(avgTicket), sub:"по завершённым" },
          { label:"Завершено",   value:`${completionRate}%`, sub:`${completed.length} из ${visits.length}` },
          { label:"Не пришли",   value:`${noShowRate}%`,    sub:`${noShow.length} визит(а)`, danger:noShowRate>10 },
          { label:"Долг",        value:fmtMoney(remainingDebt), sub:"по активным", danger:remainingDebt>0 },
          { label:"Касса",       value:null, cash:cashSum, card:cardSum },
        ].map((b,i)=>(
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2">{b.label}</div>
            {b.value!==null ? (
              <>
                <div className={`text-[20px] font-bold leading-none ${b.danger?"text-red-600":"text-zinc-900"}`}>{b.value}</div>
                {b.sub&&<div className="text-[11px] text-zinc-400 mt-1.5">{b.sub}</div>}
              </>
            ) : (
              <div className="space-y-1">
                <div className="text-[12px] text-zinc-700">Нал: <b>{fmtMoney(b.cash)}</b></div>
                <div className="text-[12px] text-zinc-700">Б/Р: <b>{fmtMoney(b.card)}</b></div>
                <div className="text-[11px] text-zinc-400">по завершённым</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnalyticsCard title="Топ-услуги по выручке" empty={topServices.length===0}>
          {topServices.map((s,i)=><BarRow key={i} label={`${s.name} · ${s.count}×`} value={s.revenue} max={maxSvcRev} money/>)}
        </AnalyticsCard>
        <AnalyticsCard title="Исполнители" empty={topStaff.length===0}>
          {topStaff.map((s,i)=><BarRow key={i} label={`${s.name} · ${s.count} визит.`} value={s.revenue} max={maxStaffRev} money/>)}
        </AnalyticsCard>
        <AnalyticsCard title="Топ-клиенты" empty={topClients.length===0}>
          {topClients.map((c,i)=><BarRow key={i} label={`${c.name} · ${c.count}×`} value={c.revenue} max={maxClientRev} money/>)}
        </AnalyticsCard>
      </div>
    </div>
  )
}