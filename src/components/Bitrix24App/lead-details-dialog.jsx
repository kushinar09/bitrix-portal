"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCcw } from "lucide-react"
import { getLeadDeals, getLeadTasks } from "../../lib/api"

function fmtDateTime(val) {
  if (!val) return "-"
  const d = new Date(val)
  return isNaN(d.getTime()) ? String(val) : d.toLocaleString()
}
function fmtMoney(val, currency = "USD") {
  if (val == null) return "-"
  const num = typeof val === "string" ? Number(val) : val
  if (!Number.isFinite(num)) return String(val)
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(num)
  } catch {
    return String(num)
  }
}
function priorityLabel(p) {
  if (!p) return "-"
  const map = { 0: "Low", 1: "Low", 2: "Normal", 3: "High" }
  return map[p] || p
}
function statusLabel(s) {
  if (!s) return "-"
  const map = { 1: "Pending", 2: "In Progress", 3: "Completed" }
  return map[s] || s
}

export default function LeadDetailsDialog({ open, onOpenChange, lead }) {
  const leadId = useMemo(() => ((lead?.id ?? lead?.ID) ? String(lead?.id ?? lead?.ID) : undefined), [lead])
  const leadTitle = lead?.TITLE ?? lead?.title ?? "-"

  const [tasks, setTasks] = useState(null)
  const [deals, setDeals] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = async () => {
    if (!leadId) return
    setLoading(true)
    setError(null)
    try {
      const [t, d] = await Promise.all([getLeadTasks(leadId), getLeadDeals(leadId)])
      const tNorm = (Array.isArray(t) ? t : []).map((x) => ({
        id: String(x.id ?? x.ID ?? x.Id ?? "unknown"),
        title: String(x.title ?? x.TITLE ?? "Untitled"),
        description: x.description ?? x.DESCRIPTION ?? null,
        priority: x.priority ?? x.PRIORITY ?? null,
        status: x.status ?? x.STATUS ?? x.subStatus ?? null,
        createdDate: x.createdDate ?? x.CREATED_DATE ?? x.DATE_CREATE ?? null,
        responsibleName:
          x.responsible?.name ?? x.RESPONSIBLE?.NAME ?? x.responsible?.Name ?? x.responsible?.NAME ?? null,
        deadline: x.deadline ?? x.DEADLINE ?? null,
      }))
      const dNorm = (Array.isArray(d) ? d : []).map((y) => ({
        ID: String(y.ID ?? y.id ?? "unknown"),
        TITLE: String(y.TITLE ?? y.title ?? "Untitled"),
        STAGE_ID: y.STAGE_ID ?? y.stageId ?? undefined,
        OPPORTUNITY: y.OPPORTUNITY ?? y.opportunity ?? undefined,
        DATE_CREATE: y.DATE_CREATE ?? y.dateCreate ?? undefined,
      }))
      setTasks(tNorm)
      setDeals(dNorm)
    } catch (e) {
      setError(e?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && leadId) {
      fetchAll()
    } else if (!open) {
      setTasks(null)
      setDeals(null)
      setError(null)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, leadId])

  const emptyTasks = !loading && !error && Array.isArray(tasks) && tasks.length === 0
  const emptyDeals = !loading && !error && Array.isArray(deals) && deals.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1100px] w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">
            {"Lead details"} <span className="text-muted-foreground">·</span>{" "}
            <span className="font-normal">{leadTitle}</span>{" "}
            <span className="text-muted-foreground">{leadId ? `(#${leadId})` : ""}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between mt-2">
            <span className="text-sm">{"View tasks and deals associated with this lead."}</span>
            <Button size="sm" variant="outline" onClick={fetchAll} disabled={loading || !leadId}>
              <RefreshCcw className={loading ? "w-4 h-4 mr-2 animate-spin" : "w-4 h-4 mr-2"} />
              {"Refresh"}
            </Button>
          </DialogDescription>
        </DialogHeader>
        <Separator />

        {/* Mobile: Tabs */}
        <div className="p-4 md:hidden">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="tasks" className="flex-1">
                {"Tasks"} {Array.isArray(tasks) ? `(${tasks.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="deals" className="flex-1">
                {"Deals"} {Array.isArray(deals) ? `(${deals.length})` : ""}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="mt-4">
              <TasksList loading={loading} error={error} tasks={tasks} empty={emptyTasks} />
            </TabsContent>
            <TabsContent value="deals" className="mt-4">
              <DealsList loading={loading} error={error} deals={deals} empty={emptyDeals} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: Split view */}
        <div className="hidden md:grid md:grid-cols-2 gap-4 p-4">
          <div>
            <h3 className="text-sm font-medium mb-2">
              {"Tasks"} {Array.isArray(tasks) ? `(${tasks.length})` : ""}
            </h3>
            <TasksList loading={loading} error={error} tasks={tasks} empty={emptyTasks} />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">
              {"Deals"} {Array.isArray(deals) ? `(${deals.length})` : ""}
            </h3>
            <DealsList loading={loading} error={error} deals={deals} empty={emptyDeals} />
          </div>
        </div>

        <div className="p-4 pt-0 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {"Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TasksList({ loading, error, tasks, empty }) {
  if (loading && !tasks) return <div className="text-sm text-muted-foreground p-4">{"Loading tasks..."}</div>
  if (error && !tasks)
    return (
      <div className="text-sm text-red-600 p-4">
        {"Error loading tasks: "}
        {error}
      </div>
    )
  if (empty) return <div className="text-sm text-muted-foreground p-4">{"No tasks found."}</div>

  return (
    <div className="grid gap-3 max-h-[55vh] overflow-auto pr-1">
      {(tasks ?? []).map((t) => (
        <Card key={t.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base font-semibold truncate">{t.title || "-"}</CardTitle>
              <div className="flex items-center gap-2">
                {t.priority ? <Badge variant="secondary">{priorityLabel(t.priority)}</Badge> : null}
                {t.status ? <Badge>{statusLabel(t.status)}</Badge> : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-foreground">{"Created: "}</span>
                <span>{fmtDateTime(t.createdDate)}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">{"Deadline: "}</span>
                <span>{fmtDateTime(t.deadline)}</span>
              </div>
            </div>
            <div>
              <span className="font-medium text-foreground">{"Responsible: "}</span>
              <span>{t.responsibleName ?? "-"}</span>
            </div>
            {t.description ? <p className="text-xs leading-relaxed pt-2">{t.description}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DealsList({ loading, error, deals, empty }) {
  if (loading && !deals) return <div className="text-sm text-muted-foreground p-4">{"Loading deals..."}</div>
  if (error && !deals)
    return (
      <div className="text-sm text-red-600 p-4">
        {"Error loading deals: "}
        {error}
      </div>
    )
  if (empty) return <div className="text-sm text-muted-foreground p-4">{"No deals found."}</div>

  return (
    <div className="grid gap-3 max-h-[55vh] overflow-auto pr-1">
      {(deals ?? []).map((d) => (
        <Card key={d.ID}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base font-semibold truncate">{d.TITLE || "-"}</CardTitle>
              <div className="flex items-center gap-2">
                {d.STAGE_ID ? <Badge variant="secondary">{d.STAGE_ID}</Badge> : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-foreground">{"Value: "}</span>
                <span>{fmtMoney(d.OPPORTUNITY)}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">{"Created: "}</span>
                <span>{fmtDateTime(d.DATE_CREATE)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
