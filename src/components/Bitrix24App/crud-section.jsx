"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Edit, Trash2, FilterIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { createLead, deleteLead, getLeads, updateLead } from "../../lib/api"
import AddEditDialog from "./add-edit-dialog"
import DeleteDialog from "./delete-dialog"
import LeadDetailsDialog from "./lead-details-dialog"


const STATUS_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Unprocessed", value: "NEW" },
  { label: "In progress", value: "IN_PROCESS" },
  { label: "Processed", value: "PROCESSED" },
  { label: "Low-quality lead", value: "JUNK" },
  { label: "High-quality lead", value: "CONVERTED" },
]
const SOURCE_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Call", value: "CALL" },
  { label: "E-mail", value: "EMAIL" },
  { label: "Website", value: "WEB" },
  { label: "Advertising", value: "ADVERTISING" },
  { label: "Existing client", value: "PARTNER" },
  { label: "By recommendation", value: "RECOMMENDATION" },
  { label: "Trade show", value: "TRADE_SHOW" },
  { label: "CRM form", value: "WEBFORM" },
  { label: "Callback", value: "CALLBACK" },
  { label: "Sales generator", value: "RC_GENERATOR" },
  { label: "Online store", value: "STORE" },
  { label: "Other", value: "OTHER" },
]
const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]))
const SOURCE_LABELS = Object.fromEntries(SOURCE_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]))

export default function Crud() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // CRUD dialogs
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)

  const [message, setMessage] = useState({ type: "", text: "" })
  const [isSaving, setIsSaving] = useState(false)

  // Details modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    source: "",
    date: "",
    sort: "DATE_CREATE",
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    fetchLeads(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchLeads = async (query) => {
    try {
      setLoading(true)
      setError(null)
      const leads = await getLeads(query)
      setData(leads.result || [])
    } catch (err) {
      console.error("Error fetching leads:", err)
      setError("Không thể tải danh sách. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      await fetchLeads(filters)
    } catch (err) {
      console.error("Error refreshing leads:", err)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsAddEditOpen(true)
  }
  const handleEdit = (item) => {
    setEditingItem(item)
    setIsAddEditOpen(true)
  }
  const handleDelete = (item) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleSave = async (formData) => {
    try {
      setIsSaving(true)
      const payload = {
        ...formData,
        phone: Array.isArray(formData.phone)
          ? formData.phone
              .filter((p) => String(p.value || "").trim() !== "")
              .map((p) => ({ value: String(p.value).trim(), valueType: String(p.type || "WORK") }))
          : [],
        email: Array.isArray(formData.email)
          ? formData.email
              .filter((e) => String(e.value || "").trim() !== "")
              .map((e) => ({ value: String(e.value).trim(), valueType: String(e.type || "WORK") }))
          : [],
      }
      if (editingItem) {
        await updateLead({ payload, id: editingItem.id })
        setMessage({ type: "success", text: "Cập nhật lead thành công!" })
      } else {
        await createLead(payload)
        setMessage({ type: "success", text: "Thêm lead thành công!" })
      }
      setIsAddEditOpen(false)
      setEditingItem(null)
      await refreshData()
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } catch (error) {
      setMessage({ type: "error", text: `Lỗi: ${error.message}` })
      setTimeout(() => setMessage({ type: "", text: "" }), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setIsSaving(true)
      await deleteLead(deletingItem.id)
      setIsDeleteOpen(false)
      setDeletingItem(null)
      await refreshData()
      setMessage({ type: "success", text: "Xóa thành công!" })
      setTimeout(() => setMessage({ type: "", text: "" }), 2000)
    } catch (error) {
      setMessage({ type: "error", text: `Lỗi khi xóa: ${error.message}` })
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const clearFilters = async () => {
    const reset = { search: "", status: "", source: "", date: "", sort: "DATE_CREATE" }
    setFilters(reset)
    await fetchLeads(reset)
  }
  const applyFilters = async () => {
    await fetchLeads(filters)
    setIsFilterOpen(false)
  }

  const renderMultipleItems = (items, type) => {
    if (!items || items.length === 0) return "-"
    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="truncate" title={item.value}>
              {type === "WEB" && item.value ? (
                <a
                  href={item.value.startsWith("http") ? item.value : `https://${item.value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </div>
            <Badge variant="secondary" className="text-xs w-fit">
              {item.type}
            </Badge>
          </div>
        ))}
      </div>
    )
  }

  const getFullName = (item) => {
    const parts = [item.NAME, item.LAST_NAME].filter(Boolean)
    return parts.join(" ")
  }

  const activeFilterCount = useMemo(() => {
    let c = 0
    if (filters.search) c++
    if (filters.status) c++
    if (filters.source) c++
    if (filters.date) c++
    return c
  }, [filters])

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Danh sách Lead</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={clearFilters} className="hidden md:flex bg-transparent">
              <X className="w-4 h-4 mr-2" />
              Xóa lọc
            </Button>

            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <FilterIcon className="w-4 h-4 mr-2" />
                  Filter
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {String(activeFilterCount)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Bộ lọc nâng cao</SheetTitle>
                  <SheetDescription>Nhấn Apply để áp dụng.</SheetDescription>
                </SheetHeader>

                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Từ khóa</label>
                    <Input
                      value={filters.search}
                      onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                      placeholder="Tìm theo Title, Name, Email, Phone..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái (STATUS_ID)</label>
                    <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((o) => (
                          <SelectItem key={o.value || "all"} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nguồn (SOURCE_ID)</label>
                    <Select value={filters.source} onValueChange={(v) => setFilters((f) => ({ ...f, source: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nguồn" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_OPTIONS.map((o) => (
                          <SelectItem key={o.value || "all"} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày tạo (DATE_CREATE)</label>
                    <Input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sắp xếp theo</label>
                    <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trường" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DATE_CREATE">Ngày tạo</SelectItem>
                        <SelectItem value="TITLE">Tiêu đề</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <SheetFooter className="mt-6">
                  <div className="flex w-full items-center justify-between gap-2">
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Đặt lại
                    </Button>
                    <SheetClose asChild>
                      <Button onClick={applyFilters}>Apply</Button>
                    </SheetClose>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Title</TableHead>
                <TableHead className="whitespace-nowrap">Name</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Source</TableHead>
                <TableHead className="whitespace-nowrap">Phone</TableHead>
                <TableHead className="whitespace-nowrap">Email</TableHead>
                <TableHead className="whitespace-nowrap">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-red-600">
                      <p>{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => fetchLeads(filters)}
                      >
                        Thử lại
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-gray-500">Danh sách trống</p>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={String(item.id)}>
                    <TableCell className="font-medium max-w-[220px] truncate" title={item.TITLE}>
                      <button
                        type="button"
                        className="underline underline-offset-2 hover:no-underline"
                        onClick={() => {
                          setSelectedLead(item)
                          setIsDetailsOpen(true)
                        }}
                        aria-label="Xem tasks & deals"
                      >
                        {item.TITLE || "-"}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate" title={getFullName(item)}>
                      {getFullName(item) || "-"}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate" title={item.STATUS_ID}>
                      {item.STATUS_ID ? STATUS_LABELS[item.STATUS_ID] || item.STATUS_ID : "-"}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate" title={item.SOURCE_ID}>
                      {item.SOURCE_ID ? SOURCE_LABELS[item.SOURCE_ID] || item.SOURCE_ID : "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px]">{renderMultipleItems(item.PHONE, "phone")}</TableCell>
                    <TableCell className="max-w-[200px]">{renderMultipleItems(item.EMAIL, "email")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {isSaving && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg border">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Đang xử lý...</span>
          </div>
        </div>
      )}
      {message.text && (
        <div className="px-6 pb-4">
          <Alert className={message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            <AlertDescription className={message.type === "success" ? "text-green-700" : "text-red-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <AddEditDialog
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        item={editingItem}
        onSave={handleSave}
        isLoading={isSaving}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        item={deletingItem}
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
      />
      <LeadDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} lead={selectedLead} />
    </Card>
  )
}
