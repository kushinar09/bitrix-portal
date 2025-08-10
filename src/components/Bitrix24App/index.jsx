"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, ChevronUp } from "lucide-react"
import { installApp } from "../../lib/api"
import CrudSection from "./crud-section"

export default function App() {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [config, setConfig] = useState({
    clientId: "",
    clientSecret: "",
    domain: "",
  })
  const [originalConfig, setOriginalConfig] = useState({
    clientId: "",
    clientSecret: "",
    domain: "",
  })
  const [isInstalled, setIsInstalled] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const getButtonText = () => {
    if (!isInstalled) return "Install"

    const hasChanges = Object.keys(config).some((key) => config[key] !== originalConfig[key])

    return hasChanges ? "Install" : "Reinstall"
  }

  const handleInstall = async () => {
    try {
      if (!config.clientId || !config.clientSecret || !config.domain) {
        setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin!" })
        return
      }

      // Call the actual install API
      await installApp(config.clientId, config.domain)

      setOriginalConfig({ ...config })
      setIsInstalled(true)
      setMessage({ type: "success", text: "Cài đặt thành công!" })

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } catch (error) {
      setMessage({ type: "error", text: `Cài đặt thất bại: ${error.message}` })
      setTimeout(() => setMessage({ type: "", text: "" }), 5000)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Quản lý hệ thống</h1>

      {/* Configuration Section */}
      <Card>
        <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cấu hình hệ thống</CardTitle>
                  <CardDescription>Thiết lập thông tin kết nối</CardDescription>
                </div>
                {isConfigOpen ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input
                    id="client-id"
                    type="password"
                    value={config.clientId}
                    onChange={(e) => handleConfigChange("clientId", e.target.value)}
                    placeholder="Nhập Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input
                    id="client-secret"
                    type="password"
                    value={config.clientSecret}
                    onChange={(e) => handleConfigChange("clientSecret", e.target.value)}
                    placeholder="Nhập Client Secret"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Handle URL</Label>
                <Input
                  id="domain"
                  type="text"
                  value={config.domain}
                  onChange={(e) => handleConfigChange("domain", e.target.value)}
                  placeholder="Nhập domain"
                />
              </div>

              <div className="flex flex-col gap-4">
                <Button onClick={handleInstall} className="w-fit">
                  {getButtonText()}
                </Button>

                {message.text && (
                  <Alert
                    className={message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}
                  >
                    <AlertDescription className={message.type === "success" ? "text-green-700" : "text-red-700"}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* CRUD Section */}
      <CrudSection />
    </div>
  )
}
