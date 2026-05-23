import { useState, useEffect, useCallback } from "react"
import {
  clientsApi,
  employeesApi,
  appointmentsApi,
  servicesApi,
  productsApi,
  serviceCategoriesApi,
  productCategoriesApi,
} from "./index"

const toArray = (v) => {
  if (!v) return []
  if (Array.isArray(v)) return v
  if (Array.isArray(v.results)) return v.results
  return []
}

export function useAppData() {
  const [data, setData] = useState({
    clients:            [],
    staff:              [],
    appointments:       [],
    services:           [],
    products:           [],
    serviceCategories:  [],
    productCategories:  [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const safe = (p) => p.catch((e) => { console.warn(e.message); return [] })
      const [clients, staff, appointments, services, products, serviceCategories, productCategories] = await Promise.all([
        safe(clientsApi.getAll()),
        safe(employeesApi.getAll()),
        safe(appointmentsApi.getAll()),
        safe(servicesApi.getAll()),
        safe(productsApi.getAll()),
        safe(serviceCategoriesApi.getAll()),
        safe(productCategoriesApi.getAll()),
      ])
      setData({
        clients:           toArray(clients),
        staff:             toArray(staff),
        appointments:      toArray(appointments),
        services:          toArray(services),
        products:          toArray(products),
        serviceCategories: toArray(serviceCategories),
        productCategories: toArray(productCategories),
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const api = {
    // ── Clients ──
    createClient: async (data) => {
      const created = await clientsApi.create(data)
      setData(d => ({ ...d, clients: [...d.clients, created] }))
      return created
    },
    updateClient: async (id, data) => {
      const updated = await clientsApi.update(id, data)
      setData(d => ({ ...d, clients: d.clients.map(c => c.id === id ? updated : c) }))
      return updated
    },
    deleteClient: async (id) => {
      await clientsApi.delete(id)
      setData(d => ({ ...d, clients: d.clients.filter(c => c.id !== id) }))
    },

    // ── Appointments ──
    createAppointment: async (data) => {
      const created = await appointmentsApi.create(data)
      setData(d => ({ ...d, appointments: [...d.appointments, created] }))
      return created
    },
    updateAppointment: async (id, data) => {
      const updated = await appointmentsApi.update(id, data)
      setData(d => ({ ...d, appointments: d.appointments.map(a => a.id === id ? updated : a) }))
      return updated
    },
    patchAppointment: async (id, patch) => {
      const updated = await appointmentsApi.patch(id, patch)
      setData(d => ({ ...d, appointments: d.appointments.map(a => a.id === id ? updated : a) }))
      return updated
    },
    deleteAppointment: async (id) => {
      await appointmentsApi.delete(id)
      setData(d => ({ ...d, appointments: d.appointments.filter(a => a.id !== id) }))
    },

    // ── Staff ──
    createStaff: async (data) => {
      const created = await employeesApi.create(data)
      setData(d => ({ ...d, staff: [...d.staff, created] }))
      return created
    },
    updateStaff: async (id, data) => {
      const updated = await employeesApi.update(id, data)
      setData(d => ({ ...d, staff: d.staff.map(s => s.id === id ? updated : s) }))
      return updated
    },
    deleteStaff: async (id) => {
      await employeesApi.delete(id)
      setData(d => ({ ...d, staff: d.staff.filter(s => s.id !== id) }))
    },

    // ── Services ──
    createService: async (data) => {
      const created = await servicesApi.create(data)
      setData(d => ({ ...d, services: [...d.services, created] }))
      return created
    },
    updateService: async (id, data) => {
      const updated = await servicesApi.update(id, data)
      setData(d => ({ ...d, services: d.services.map(s => s.id === id ? updated : s) }))
      return updated
    },
    deleteService: async (id) => {
      await servicesApi.delete(id)
      setData(d => ({ ...d, services: d.services.filter(s => s.id !== id) }))
    },

    // ── Products ──
    createProduct: async (data) => {
      const created = await productsApi.create(data)
      setData(d => ({ ...d, products: [...d.products, created] }))
      return created
    },
    updateProduct: async (id, data) => {
      const updated = await productsApi.update(id, data)
      setData(d => ({ ...d, products: d.products.map(p => p.id === id ? updated : p) }))
      return updated
    },
    adjustProductStock: async (id, delta) => {
      const product = data.products.find(p => p.id === id)
      if (!product) return
      const newStock = Math.max(0, (Number(product.stock) || 0) + delta)
      const updated = await productsApi.patch(id, { stock: newStock })
      setData(d => ({ ...d, products: d.products.map(p => p.id === id ? updated : p) }))
      return updated
    },
    deleteProduct: async (id) => {
      await productsApi.delete(id)
      setData(d => ({ ...d, products: d.products.filter(p => p.id !== id) }))
    },

    // ── Service Categories ──
    createServiceCategory: async (data) => {
      const created = await serviceCategoriesApi.create(data)
      setData(d => ({ ...d, serviceCategories: [...d.serviceCategories, created] }))
      return created
    },
    deleteServiceCategory: async (id) => {
      await serviceCategoriesApi.delete(id)
      setData(d => ({ ...d, serviceCategories: d.serviceCategories.filter(c => c.id !== id) }))
    },

    // ── Product Categories ──
    createProductCategory: async (data) => {
      const created = await productCategoriesApi.create(data)
      setData(d => ({ ...d, productCategories: [...d.productCategories, created] }))
      return created
    },
    deleteProductCategory: async (id) => {
      await productCategoriesApi.delete(id)
      setData(d => ({ ...d, productCategories: d.productCategories.filter(c => c.id !== id) }))
    },
  }

  return { data, loading, error, refresh: load, api }
}