// Utility functions for export/import

export async function exportData(type: "posts" | "campaigns", format: "csv" | "json", ids?: string[]) {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, format, ids }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to export data")
  }

  if (format === "json") {
    const data = await response.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    const text = await response.text()
    const blob = new Blob([text], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export async function importData(type: "posts" | "campaigns", file: File): Promise<any> {
  const text = await file.text()
  let data: any[]

  if (file.name.endsWith(".json")) {
    data = JSON.parse(text)
  } else if (file.name.endsWith(".csv")) {
    // Simple CSV parser
    const lines = text.split("\n").filter(line => line.trim())
    if (lines.length === 0) throw new Error("CSV file is empty")
    
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
    data = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""))
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ""
      })
      return obj
    })
  } else {
    throw new Error("Unsupported file format. Please use CSV or JSON.")
  }

  const response = await fetch("/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to import data")
  }

  return response.json()
}

export async function bulkDelete(type: "posts" | "campaigns", ids: string[]): Promise<void> {
  const response = await fetch(`/api/${type}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", ids }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete items")
  }
}

export async function bulkUpdateStatus(
  type: "posts" | "campaigns",
  ids: string[],
  status: string
): Promise<void> {
  const response = await fetch(`/api/${type}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", ids, data: { status } }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update status")
  }
}

