const BASE_URL = "http://146.120.213.146/api"

export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`[${res.status}] ${path}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

function crud(resource) {
  return {
    getAll:  ()         => request(`/${resource}/`),
    getById: (id)       => request(`/${resource}/${id}/`),
    create:  (data)     => request(`/${resource}/`, { method: "POST",  body: JSON.stringify(data) }),
    update:  (id, data) => request(`/${resource}/${id}/`, { method: "PUT",   body: JSON.stringify(data) }),
    patch:   (id, data) => request(`/${resource}/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
    delete:  (id)       => request(`/${resource}/${id}/`, { method: "DELETE" }),
  }
}

export const clientsApi         = crud("clients")
export const employeesApi       = crud("employees")
export const appointmentsApi    = crud("appointments")
export const servicesApi        = crud("services")
export const productsApi        = crud("products")
export const serviceCategoriesApi = crud("service-categories")
export const roomsApi           = crud("rooms")