const BASE_URL = "http://146.120.213.146/api"

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`[${res.status}] ${path}: ${text}`)
  }
  return res.json()
}

// ── Clients ──────────────────────────────────────────────
export const clientsApi = {
  getAll:  ()           => request("/clients/"),
  getById: (id)         => request(`/clients/${id}/`),
  create:  (data)       => request("/clients/", { method: "POST", body: JSON.stringify(data) }),
  update:  (id, data)   => request(`/clients/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  patch:   (id, data)   => request(`/clients/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete:  (id)         => request(`/clients/${id}/`, { method: "DELETE" }),
}

// ── Employees ─────────────────────────────────────────────
export const employeesApi = {
  getAll:  ()           => request("/employees/"),
  getById: (id)         => request(`/employees/${id}/`),
  create:  (data)       => request("/employees/", { method: "POST", body: JSON.stringify(data) }),
  update:  (id, data)   => request(`/employees/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  patch:   (id, data)   => request(`/employees/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete:  (id)         => request(`/employees/${id}/`, { method: "DELETE" }),
}

// ── Appointments ──────────────────────────────────────────
export const appointmentsApi = {
  getAll:  ()           => request("/appointments/"),
  getById: (id)         => request(`/appointments/${id}/`),
  create:  (data)       => request("/appointments/", { method: "POST", body: JSON.stringify(data) }),
  update:  (id, data)   => request(`/appointments/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  patch:   (id, data)   => request(`/appointments/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete:  (id)         => request(`/appointments/${id}/`, { method: "DELETE" }),
}

// ── Services ──────────────────────────────────────────────
export const servicesApi = {
  getAll:  ()           => request("/services/"),
  getById: (id)         => request(`/services/${id}/`),
  create:  (data)       => request("/services/", { method: "POST", body: JSON.stringify(data) }),
  update:  (id, data)   => request(`/services/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  patch:   (id, data)   => request(`/services/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete:  (id)         => request(`/services/${id}/`, { method: "DELETE" }),
}

// ── Products ──────────────────────────────────────────────
export const productsApi = {
  getAll:  ()           => request("/products/"),
  getById: (id)         => request(`/products/${id}/`),
  create:  (data)       => request("/products/", { method: "POST", body: JSON.stringify(data) }),
  update:  (id, data)   => request(`/products/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  patch:   (id, data)   => request(`/products/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete:  (id)         => request(`/products/${id}/`, { method: "DELETE" }),
}

// ── Categories ────────────────────────────────────────────
export const categoriesApi = {
  getAll:  ()           => request("/categories/"),
  getById: (id)         => request(`/categories/${id}/`),
  create:  (data)       => request("/categories/", { method: "POST", body: JSON.stringify(data) }),
  update:  (id, data)   => request(`/categories/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  patch:   (id, data)   => request(`/categories/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete:  (id)         => request(`/categories/${id}/`, { method: "DELETE" }),
}