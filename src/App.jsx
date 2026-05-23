import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import AppointmentsPage from "./pages/AppointmentsPage";
import CalendarPage     from "./pages/CalendarPage";
import ClientsPage      from "./pages/ClientsPage";
import StaffPage        from "./pages/StaffPage";
import AnalyticsPage    from "./pages/AnalyticsPage";
import ServicesPage     from "./pages/ServicesPage"; 
import ProductsPage     from "./pages/ProductsPage";
import SettingsPage     from "./pages/SettingsPage";
import LoginPage        from "./pages/LoginPage";

export default function App() {
  // Эти данные придут из стора (Zustand / Context / Redux)
  const clinic   = { name: "PROlab Medical", shortName: "PROlab", logo: "" };
  const user     = { name: "Администратор", role: "admin" };
  const counters = { appointments: 5, clients: 24, staff: 4, products: 3 };

  const handleLogout          = () => { /* ... */ };
  const handleNewAppointment  = () => { /* открыть модал */ };
  const handleNewStaff        = () => { /* открыть модал */ };
  const handleNewService      = () => { /* открыть модал */ };
  const handleNewProduct      = () => { /* открыть модал */ };

  return (
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />

        {/* Защищённые маршруты — всё внутри Layout */}
        <Route
          element={
            <Layout
              clinic={clinic}
              user={user}
              counters={counters}
              onLogout={handleLogout}
              onNewAppointment={handleNewAppointment}
              onNewStaff={handleNewStaff}
              onNewService={handleNewService}
              onNewProduct={handleNewProduct}
            />
          }
        >
          <Route index element={<Navigate to="/appointments" replace />} />
          <Route path="/appointments" element={<AppointmentsPage
      // appointments={appointments}
      // clients={clients}
      // services={services}
      // categories={categories}
      // staff={staff}
      // rooms={rooms}
      // onSave={(visitData) => addAppointment(visitData)}
      // onClientCreate={(data) => createAndReturnClient(data)}
      // onRowClick={(id) => openDetailModal(id)}
      // onEdit={(id) => openEditModal(id)}
          />} />
          <Route path="/calendar"     element={<CalendarPage />} />
          <Route path="/clients"      element={<ClientsPage />} />
          <Route path="/staff"        element={<StaffPage />} />
          <Route path="/analytics"    element={<AnalyticsPage />} />
          <Route path="/services"     element={<ServicesPage />} />
          <Route path="/products"     element={<ProductsPage />} />
          <Route path="/settings"     element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/appointments" replace />} />
      </Routes>
  );
}