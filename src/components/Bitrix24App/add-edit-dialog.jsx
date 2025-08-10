"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

const PHONE_TYPES = ["WORK", "MOBILE", "FAX", "HOME", "PAGER", "MAILING", "OTHER"]
const EMAIL_TYPES = ["WORK", "HOME", "MAILING", "OTHER"]

const STATUS_OPTIONS = [
  { label: "Unprocessed", value: "NEW" },
  { label: "In progress", value: "IN_PROCESS" },
  { label: "Processed", value: "PROCESSED" },
  { label: "Low-quality lead", value: "JUNK" },
  { label: "High-quality lead", value: "CONVERTED" },
]

const SOURCE_OPTIONS = [
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

// Normalize helper
function normalizeMultiArray(arr, defType) {
  const list = Array.isArray(arr) ? arr : []
  const mapped = list.map((x) => ({
    type: x?.type || x?.TYPE || x?.valueType || defType,
    value: x?.value || x?.VALUE || "",
  }))
  return mapped.length ? mapped : [{ type: defType, value: "" }]
}

export default function AddEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    lastName: "",
    phone: [{ type: "WORK", value: "" }],
    email: [{ type: "WORK", value: "" }],
    statusId: "",
    sourceId: "WEB",
    comments: "",
  })
  const [formMsg, setFormMsg] = useState({ type: "", text: "" })

  useEffect(() => {
    setFormMsg({ type: "", text: "" })
    if (item) {
      const title = item.title ?? item.TITLE ?? ""
      const name = item.name ?? item.NAME ?? ""
      const lastName = item.lastName ?? item.LAST_NAME ?? ""
      const statusId = item.statusId ?? item.STATUS_ID ?? ""
      const sourceId = item.sourceId ?? item.SOURCE_ID ?? "WEB"
      const comments = item.comments ?? item.COMMENTS ?? ""

      const phone = normalizeMultiArray(item.phone ?? item.PHONE, "WORK")
      const email = normalizeMultiArray(item.email ?? item.EMAIL, "WORK")

      setFormData({ title, name, lastName, phone, email, statusId, sourceId, comments })
    } else {
      setFormData({
        title: "",
        name: "",
        lastName: "",
        phone: [{ type: "WORK", value: "" }],
        email: [{ type: "WORK", value: "" }],
        statusId: "",
        sourceId: "WEB",
        comments: "",
      })
    }
  }, [item, open])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayItemChange = (arrayName, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    }))
  }

  const addArrayItem = (arrayName, defaultType) => {
    setFormData((prev) => ({ ...prev, [arrayName]: [...prev[arrayName], { type: defaultType, value: "" }] }))
  }

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormMsg({ type: "", text: "" })

    // Client-side validation (server will re-validate). [^1]
    if (!formData.title.trim()) {
      setFormMsg({ type: "error", text: "Title là bắt buộc." })
      return
    }
    if (!formData.name.trim()) {
      setFormMsg({ type: "error", text: "Tên là bắt buộc." })
      return
    }
    if (!formData.statusId) {
      setFormMsg({ type: "error", text: "Vui lòng chọn trạng thái." })
      return
    }
    if (!formData.sourceId) {
      setFormMsg({ type: "error", text: "Vui lòng chọn nguồn." })
      return
    }
    const phoneClean = formData.phone.filter((p) => String(p.value || "").trim() !== "")
    if (phoneClean.length === 0) {
      setFormMsg({ type: "error", text: "Ít nhất một số điện thoại là bắt buộc." })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const emailClean = formData.email
      .filter((e) => String(e.value || "").trim() !== "")
      .map((e) => e.value.trim())
    const invalidEmail = emailClean.find((em) => !emailRegex.test(em))
    if (invalidEmail) {
      setFormMsg({ type: "error", text: `Email không hợp lệ: ${invalidEmail}` })
      return
    }

    const cleanedData = {
      title: formData.title.trim(),
      name: formData.name.trim(),
      lastName: formData.lastName?.trim() || undefined,
      phone: formData.phone
        .filter((p) => String(p.value).trim() !== "")
        .map((p) => ({ value: String(p.value).trim(), type: String(p.type || "WORK") })),
      email: formData.email
        .filter((e) => String(e.value).trim() !== "")
        .map((e) => ({ value: String(e.value).trim(), type: String(e.type || "WORK") })),
      statusId: formData.statusId,
      sourceId: formData.sourceId,
      comments: formData.comments?.trim() || undefined,
    }

    onSave(cleanedData)
  }

  const renderArraySection = (title, arrayName, types, placeholder) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {formData[arrayName].map((it, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">Giá trị</Label>
              <Input
                value={it.value}
                onChange={(e) => handleArrayItemChange(arrayName, index, "value", e.target.value)}
                placeholder={placeholder}
              />
            </div>
            <div className="w-32">
              <Label className="text-xs">Loại</Label>
              <Select
                value={it.type}
                onValueChange={(value) => handleArrayItemChange(arrayName, index, "type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeArrayItem(arrayName, index)}
              disabled={formData[arrayName].length === 1}
              aria-label={`Xóa ${title} #${index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(arrayName, types[0])} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Thêm {title.toLowerCase()}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Chỉnh sửa" : "Thêm mới"}</DialogTitle>
          <DialogDescription>{item ? "Cập nhật thông tin lead" : "Nhập thông tin lead mới"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Trạng thái (STATUS_ID) <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.statusId} onValueChange={(v) => handleChange("statusId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Nguồn (SOURCE_ID) <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.sourceId} onValueChange={(v) => handleChange("sourceId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nguồn" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderArraySection("Số điện thoại", "phone", PHONE_TYPES, "0909123456")}
              {renderArraySection("Email", "email", EMAIL_TYPES, "example@email.com")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Ghi chú</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleChange("comments", e.target.value)}
                placeholder="Nhập ghi chú (tùy chọn)"
                className="min-h-[90px]"
              />
            </div>

            {formMsg.text ? (
              <Alert className={formMsg.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                <AlertDescription className={formMsg.type === "success" ? "text-green-700" : "text-red-700"}>
                  {formMsg.text}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {item ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
