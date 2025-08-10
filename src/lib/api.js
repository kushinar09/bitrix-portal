const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080"
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || "local.xxxxxx"
const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL || "https://xxxxxx.bitrix24.vn"
const domain = import.meta.env.VITE_DOMAIN || "https://xxxxxx.bitrix24.vn"

export function installApp(id = CLIENT_ID, redirectUri = REDIRECT_URL) {
  const installUrl = `${domain}/oauth/authorize?client_id=${encodeURIComponent(id)}&redirect_uri=${encodeURIComponent(redirectUri)}`
  window.location.href = installUrl
}

function buildQueryString(query) {
  if (!query) return ""
  const params = new URLSearchParams()
  if (query.search) params.set("search", query.search)
  if (query.status) params.set("status", query.status)
  if (query.source) params.set("source", query.source)
  if (query.date) params.set("date", query.date) // YYYY-MM-DD
  if (query.sort) params.set("sort", query.sort) // 'DATE_CREATE' | 'TITLE'
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

const parseList = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || "Network response was not ok")
  }
  const data = await res.json().catch(() => ({}))
  if (Array.isArray(data)) return data
  if (Array.isArray(data.result)) return data.result
  return []
}

export function getLeads(query) {
  const url = `${baseUrl}/leads${buildQueryString(query)}`
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(text || "Network response was not ok")
      }
      return response.json()
    })
    .catch((error) => {
      console.warn("getLeads failed:", error?.message || error)
      // return sampleLeads()
    })
}

export function createLead(lead) {
  const url = `${baseUrl}/leads`
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(lead),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create contact")
      }
    })
    .catch((error) => {
      console.error("Create contact error:", error)
      throw error
    })
}

export function updateLead(lead, id) {
  const url = `${baseUrl}/leads/${id}`
  return fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(lead),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update contact")
      }
    })
    .catch((error) => {
      console.error("Update contact error:", error)
      throw error
    })
}

export function deleteLead(id) {
  const url = `${baseUrl}/leads/${id}`
  return fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete contact")
      }
    })
    .catch((error) => {
      console.error("Delete contact error:", error)
      throw error
    })
}

// NEW: per-lead tasks & deals
export function getLeadTasks(leadId) {
  const url = `${baseUrl}/leads/${encodeURIComponent(String(leadId))}/tasks`
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })
    .then(parseList)
    .catch((error) => {
      console.warn("getLeadTasks failed:", error?.message || error)
      // return sampleTasks()
    })
}

export function getLeadDeals(leadId) {
  const url = `${baseUrl}/leads/${encodeURIComponent(String(leadId))}/deals`
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })
    .then(parseList)
    .catch((error) => {
      console.warn("getLeadDeals failed: ", error?.message || error)
      // return sampleDeals()
    })
}

async function getJson(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Analytics: Leads
export async function getAnalyticsLeads() {
  const url = `${baseUrl}/analytics/leads`
  try {
    return await getJson(url)
  } catch (e) {
    console.warn("getAnalyticsLeads failed, using fallback:", e?.message || e)
    return {
      counts: { NEW: 0, IN_PROGRESS: 0, CONVERTED: 0, LOST: 0, UNKNOWN: 0 },
      total: 0,
    }
  }
}

// Analytics: Deals (conversion, revenue)
export async function getAnalyticsDeals() {
  const url = `${baseUrl}/analytics/deals`
  try {
    return await getJson(url)
  } catch (e) {
    console.warn("getAnalyticsDeals failed, using fallback:", e?.message || e)
    return {
      totalLeads: 0,
      totalDeals: 0,
      conversionRate: 0,
      expectedRevenue: 0,
    }
  }
}

// Analytics: Tasks per user
export async function getAnalyticsTasks() {
  const url = `${baseUrl}/analytics/tasks`
  try {
    return await getJson(url)
  } catch (e) {
    console.warn("getAnalyticsTasks failed, using fallback:", e?.message || e)
    return {
      perUser: {},
      totalTasks: 0,
    }
  }
}