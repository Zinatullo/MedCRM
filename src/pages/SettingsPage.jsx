import { useState } from "react"

function IconCheck() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconDownload() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function IconRefresh() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
}
function IconTrash() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
}
function IconPhone() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 11 19.79 19.79 0 0 1 1.04 2.41a2 2 0 0 1 2-.97h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}
function IconMail() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}

function Label({ children }) {
  return <label className="block text-[12px] font-medium text-zinc-500 mb-1">{children}</label>
}
function Input({ ...props }) {
  return <input {...props} className="w-full h-9 px-3 text-[13px] border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
}
function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h3 className="text-[14px] font-semibold text-zinc-900">{children}</h3>
      {sub&&<p className="text-[13px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}
function Card({ children }) {
  return <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-3 shadow-sm">{children}</div>
}
function FormRow2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">{children}</div>
}
function FormRow({ children }) {
  return <div className="mb-3">{children}</div>
}
function PrimaryBtn({ children, onClick }) {
  return <button onClick={onClick} className="h-8 px-3 inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-md transition-colors">{children}</button>
}
function SecondaryBtn({ children, onClick }) {
  return <button onClick={onClick} className="h-8 px-3 inline-flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[13px] font-medium rounded-md transition-colors">{children}</button>
}
function DangerBtn({ children, onClick }) {
  return <button onClick={onClick} className="h-8 px-3 inline-flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-red-50 hover:border-red-200 text-red-600 text-[13px] font-medium rounded-md transition-colors">{children}</button>
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id:"clinic",    label:"Клиника"    },
  { id:"rooms",     label:"Кабинеты"   },
  { id:"whatsapp",  label:"WhatsApp"   },
  { id:"data",      label:"Данные"     },
  { id:"about",     label:"О системе"  },
]

/**
 * Props:
 *   clinic        — объект (name, shortName, logo, address, gis, phone, whatsapp, email, website, instagram, telegram, facebook, workHours)
 *   rooms         — array
 *   greenApi      — { idInstance, apiToken, enabled, autoSchedule }
 *   system        — { productName, version, description, supportPhone, supportWhatsapp, supportEmail, supportTelegram, supportWebsite, supportSchedule }
 *   onSaveClinic  — (clinic) => void
 *   onSaveGreenApi — (ga) => void
 *   onExport      — () => void
 *   onImport      — (file) => void
 *   onResetDemo   — () => void
 *   onClearAll    — () => void
 *   onNewRoom     — () => void
 *   onEditRoom    — (roomId) => void
 */
export default function SettingsPage({
  clinic={}, rooms=[], greenApi={}, system={},
  onSaveClinic, onSaveGreenApi,
  onExport, onImport, onResetDemo, onClearAll,
  onNewRoom, onEditRoom,
}) {
  const [tab, setTab] = useState("clinic")
  const [cl, setCl]   = useState({ name:"", shortName:"", address:"", gis:"", phone:"", whatsapp:"", email:"", website:"", instagram:"", telegram:"", facebook:"", workHours:"", ...clinic })
  const [ga, setGa]   = useState({ idInstance:"", apiToken:"", enabled:false, autoSchedule:true, ...greenApi })

  const setCLField = (k) => (e) => setCl(f=>({...f,[k]:e.target.value}))
  const setGAField = (k) => (e) => setGa(f=>({...f,[k]:e.target.value}))

  return (
    <div>
      {/* tabs */}
      <div className="flex bg-zinc-100 p-0.5 rounded-lg w-fit mb-4 flex-wrap gap-0.5">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${tab===t.id?"bg-white text-blue-600 shadow-sm":"text-zinc-500 hover:text-zinc-900"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CLINIC ── */}
      {tab==="clinic"&&(
        <Card>
          <SectionTitle sub="Данные используются в сайдбаре и WhatsApp-сообщениях">Информация о клинике</SectionTitle>
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2 border-b border-zinc-100 pb-1">Идентификация</div>
          <FormRow2>
            <div><Label>Название клиники *</Label><Input value={cl.name} onChange={setCLField("name")} placeholder="PROlab Medical"/></div>
            <div><Label>Краткое имя</Label><Input value={cl.shortName} onChange={setCLField("shortName")} placeholder="PROlab"/></div>
          </FormRow2>
          <FormRow><Label>Режим работы</Label><Input value={cl.workHours} onChange={setCLField("workHours")} placeholder="Пн–Сб 09:00–20:00"/></FormRow>

          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2 mt-4 border-b border-zinc-100 pb-1">Контакты</div>
          <FormRow><Label>Адрес</Label><Input value={cl.address} onChange={setCLField("address")} placeholder="г. Бишкек, ул. ..."/></FormRow>
          <FormRow><Label>Ссылка 2ГИС <span className="font-normal text-zinc-400">(добавляется в WhatsApp)</span></Label><Input value={cl.gis} onChange={setCLField("gis")} placeholder="https://2gis.kg/..."/></FormRow>
          <FormRow2>
            <div><Label>Телефон</Label><Input value={cl.phone} onChange={setCLField("phone")} placeholder="+996 ..."/></div>
            <div><Label>WhatsApp</Label><Input value={cl.whatsapp} onChange={setCLField("whatsapp")} placeholder="+996 ..."/></div>
          </FormRow2>
          <FormRow2>
            <div><Label>Email</Label><Input value={cl.email} onChange={setCLField("email")} placeholder="info@clinic.kg"/></div>
            <div><Label>Сайт</Label><Input value={cl.website} onChange={setCLField("website")} placeholder="https://..."/></div>
          </FormRow2>

          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-zinc-400 mb-2 mt-4 border-b border-zinc-100 pb-1">Соцсети</div>
          <FormRow2>
            <div><Label>Instagram</Label><Input value={cl.instagram} onChange={setCLField("instagram")} placeholder="@profile"/></div>
            <div><Label>Telegram</Label><Input value={cl.telegram} onChange={setCLField("telegram")} placeholder="@channel"/></div>
          </FormRow2>
          <FormRow><Label>Facebook</Label><Input value={cl.facebook} onChange={setCLField("facebook")} placeholder="ссылка на страницу"/></FormRow>

          <div className="mt-4 flex gap-2">
            <PrimaryBtn onClick={()=>onSaveClinic?.(cl)}><IconCheck/><span>Сохранить</span></PrimaryBtn>
          </div>
        </Card>
      )}

      {/* ── ROOMS ── */}
      {tab==="rooms"&&(
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-blue-50/40 border-b border-zinc-200 flex items-center justify-between">
            <span className="text-[13px] font-medium text-zinc-700">Кабинеты клиники</span>
            <PrimaryBtn onClick={onNewRoom}><span>+ Новый кабинет</span></PrimaryBtn>
          </div>
          {rooms.length===0 ? (
            <div className="py-14 text-center text-zinc-400 text-[13px]">Кабинетов нет</div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Название</th>
                  <th className="px-3.5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Статус</th>
                  <th className="px-3.5 py-2.5"/>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r=>(
                  <tr key={r.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-3.5 py-3 font-medium text-zinc-900">{r.name}</td>
                    <td className="px-3.5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${r.active!==false?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.active!==false?"bg-green-500":"bg-red-500"}`}/>
                        {r.active!==false?"Активен":"Не активен"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button onClick={()=>onEditRoom?.(r.id)} className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors ml-auto">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── WHATSAPP ── */}
      {tab==="whatsapp"&&(
        <Card>
          <SectionTitle sub="Автоматическая рассылка напоминаний через Green API. Пауза 60–90 сек между сообщениями.">WhatsApp (Green API)</SectionTitle>
          <div className="text-[12px] text-zinc-500 mb-4 leading-relaxed">
            Получите <b>idInstance</b> и <b>apiTokenInstance</b> в{" "}
            <a href="https://green-api.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">green-api.com</a>.
          </div>
          <FormRow2>
            <div><Label>idInstance</Label><Input value={ga.idInstance} onChange={setGAField("idInstance")} placeholder="1101234567"/></div>
            <div><Label>apiTokenInstance</Label><Input value={ga.apiToken} onChange={setGAField("apiToken")} placeholder="abc123…"/></div>
          </FormRow2>
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-zinc-700">
              <input type="checkbox" checked={ga.enabled} onChange={e=>setGa(f=>({...f,enabled:e.target.checked}))} className="w-4 h-4 cursor-pointer"/>
              Включить отправку
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-zinc-700">
              <input type="checkbox" checked={ga.autoSchedule} onChange={e=>setGa(f=>({...f,autoSchedule:e.target.checked}))} className="w-4 h-4 cursor-pointer"/>
              Авто-рассылка (9–21, пока вкладка открыта)
            </label>
          </div>
          <div className="flex gap-2">
            <SecondaryBtn onClick={()=>{}}><IconRefresh/><span>Тест соединения</span></SecondaryBtn>
            <PrimaryBtn onClick={()=>onSaveGreenApi?.(ga)}><IconCheck/><span>Сохранить</span></PrimaryBtn>
          </div>
        </Card>
      )}

      {/* ── DATA ── */}
      {tab==="data"&&(
        <div className="space-y-3">
          <Card>
            <SectionTitle sub="Сохраните копию всех данных в файл или загрузите ранее сохранённую">Резервное копирование</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <SecondaryBtn onClick={onExport}><IconDownload/><span>Скачать резервную копию</span></SecondaryBtn>
              <label className="h-8 px-3 inline-flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[13px] font-medium rounded-md transition-colors cursor-pointer">
                <span>Загрузить из файла</span>
                <input type="file" accept=".json" className="hidden" onChange={e=>{ if(e.target.files[0]) onImport?.(e.target.files[0]); e.target.value="" }}/>
              </label>
            </div>
          </Card>
          <Card>
            <SectionTitle sub="Восстановит исходные демо-данные. Все ваши изменения будут потеряны.">Сброс демо-данных</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <SecondaryBtn onClick={onResetDemo}><IconRefresh/><span>Сбросить и загрузить демо</span></SecondaryBtn>
              <DangerBtn onClick={onClearAll}><IconTrash/><span>Очистить все данные</span></DangerBtn>
            </div>
          </Card>
        </div>
      )}

      {/* ── ABOUT ── */}
      {tab==="about"&&(
        <Card>
          <SectionTitle sub={system.description||""}>
            {system.productName||"PROlab Medical"} <span className="font-normal text-zinc-400">· v{system.version||"—"}</span>
          </SectionTitle>
          <div className="divide-y divide-zinc-100">
            {[
              system.supportPhone    && { icon:<IconPhone/>, label:"Телефон",  value:system.supportPhone,    href:`tel:${system.supportPhone}` },
              system.supportWhatsapp && { icon:"💬",         label:"WhatsApp", value:system.supportWhatsapp, href:`https://wa.me/${system.supportWhatsapp.replace(/\D/g,"")}` },
              system.supportEmail    && { icon:<IconMail/>,  label:"Email",    value:system.supportEmail,    href:`mailto:${system.supportEmail}` },
              system.supportTelegram && { icon:"✈️",         label:"Telegram", value:system.supportTelegram, href:`https://t.me/${system.supportTelegram.replace(/^@/,"")}` },
              system.supportWebsite  && { icon:"🌐",         label:"Сайт",     value:system.supportWebsite,  href:system.supportWebsite },
              system.supportSchedule && { icon:"🕓",         label:"График",   value:system.supportSchedule, href:null },
            ].filter(Boolean).map((r,i)=>(
              <div key={i} className="flex items-center gap-3 py-2.5 text-[13px]">
                <span className="text-zinc-400 shrink-0 flex items-center gap-1.5 min-w-30 text-[12px] font-medium">
                  {typeof r.icon==="string" ? r.icon : r.icon} {r.label}
                </span>
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium break-all">{r.value}</a>
                ) : (
                  <span className="text-zinc-700 font-medium">{r.value}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}