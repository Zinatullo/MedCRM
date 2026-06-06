import { useState } from "react"
import { useAppData } from "./api/useAppData"

// pages
import LoginPage        from "./pages/LoginPage"
import AppointmentsPage from "./pages/AppointmentsPage"
import CalendarPage     from "./pages/CalendarPage"
import ClientsPage      from "./pages/ClientsPage"
import StaffPage        from "./pages/StaffPage"
import ServicesPage     from "./pages/ServicesPage"
import ProductsPage     from "./pages/ProductsPage"
import AnalyticsPage    from "./pages/AnalyticsPage"
import SettingsPage     from "./pages/SettingsPage"

// Страница из роутера — замени на свой роутинг
const PAGES = ["appointments","calendar","clients","staff","services","products","analytics","settings"]

export default function App() {
  const [authed, setAuthed]   = useState(false)
  const [page, setPage]       = useState("appointments")
  const { data, loading, error, refresh, api } = useAppData()

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <LoginPage
        onLogin={async ({ login, password }) => {
          // Замени на реальную проверку / запрос к API
          if (login === "admin" && password === "demo") setAuthed(true)
          else throw new Error("Неверный логин или пароль")
        }}
      />
    )
  }

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center h-screen text-zinc-400">Загрузка…</div>
  if (error)   return (
    <div className="flex flex-col items-center justify-center h-screen gap-3 text-red-600">
      <div>{error}</div>
      <button onClick={refresh} className="px-4 py-2 bg-zinc-900 text-white rounded-md text-[13px]">Повторить</button>
    </div>
  )

  const { clients, staff, appointments, services, products, categories } = data

  // ── Pages ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* твой Layout / Sidebar тут */}

      {page === "appointments" && (
        <AppointmentsPage
          appointments={appointments}
          clients={clients}
          services={services}
          categories={categories}
          staff={staff}
          rooms={[]}                          // rooms пока нет в API — передавай из settings/state
          onSave={api.createAppointment}
          onClientCreate={api.createClient}
          onEdit={(id) => { /* открыть модал редактирования */ }}
          onRowClick={(id) => { /* открыть детальный модал */ }}
        />
      )}

      {page === "calendar" && (
        <CalendarPage
          appointments={appointments}
          clients={clients}
          services={services}
          staff={staff}
          rooms={[]}
          onEdit={(id) => { /* открыть модал */ }}
          onStatusChange={(id, status) => api.patchAppointment(id, { status })}
          onNewAppointment={(date, time) => { /* открыть VisitBuilder с предзаполненной датой */ }}
        />
      )}

      {page === "clients" && (
        <ClientsPage
          clients={clients}
          appointments={appointments}
          services={services}
          onAdd={api.createClient}
          onEdit={(id) => { /* открыть модал */ }}
          onNewAppointment={(clientId) => { /* переключить на appointments с clientId */ }}
        />
      )}

      {page === "staff" && (
        <StaffPage
          staff={staff}
          appointments={appointments}
          clients={clients}
          rooms={[]}
          onEdit={(id) => { /* открыть модал */ }}
          onAppointmentClick={(id) => { /* показать детали записи */ }}
        />
      )}

      {page === "services" && (
        <ServicesPage
          services={services}
          categories={categories}
          onEdit={(id) => { /* открыть модал */ }}
          onDelete={api.deleteService}
          onNew={() => { /* открыть модал создания */ }}
        />
      )}

      {page === "products" && (
        <ProductsPage
          products={products}
          onEdit={(id) => { /* открыть модал */ }}
          onDetail={(id) => { /* открыть детали */ }}
          onAdjust={api.adjustProductStock}
          onNew={() => { /* открыть модал */ }}
        />
      )}

      {page === "analytics" && (
        <AnalyticsPage
          appointments={appointments}
          clients={clients}
          services={services}
          staff={staff}
          rooms={[]}
        />
      )}

{page === "settings" && (
  <SettingsPage
    clinic={{}}
    rooms={data.rooms || []}
    greenApi={{}}
    system={{ productName: "PROlab Medical", version: "1.0" }}
    onSaveClinic={(cl) => {}}
    onSaveGreenApi={(ga) => {}}
    onExport={() => {}}
    onImport={(file) => {}}
    onResetDemo={() => {}}
    onClearAll={() => {}}
    onNewRoom={() => {}}
    onEditRoom={(id) => {}}
        system={{
      productName:      "PROlab Medical",
      version:          "2.0",
      description:      "Медицинская CRM-система для клиник косметологии и эстетики.",
      supportPhone:     "+996 555 000 000",
      supportWhatsapp:  "+996 555 000 000",
      supportEmail:     "support@prolab-medical.kg",
      supportTelegram:  "@prolab_support",
      supportWebsite:   "https://prolab-medical.kg",
      supportSchedule:  "Пн–Пт 09:00–18:00 (Bishkek)",
    }}
  />
)}
    </div>
  )
}