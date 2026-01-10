"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"
import { Save, Trash2, Settings, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PLATFORMS = [
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
] as const

interface OAuthCredential {
  id?: string
  platform: string
  client_id: string
  client_secret: string
  redirect_uri: string
  is_active?: boolean
}

export default function OAuthCredentialsPage() {
  const [credentials, setCredentials] = useState<Record<string, OAuthCredential>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const { toast } = useToast()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/oauth-credentials")
      const data = await response.json()

      if (response.ok) {
        const credsMap: Record<string, OAuthCredential> = {}
        data.credentials?.forEach((cred: any) => {
          credsMap[cred.platform] = {
            id: cred.id,
            platform: cred.platform,
            client_id: cred.client_id,
            client_secret: cred.client_secret,
            redirect_uri: cred.redirect_uri,
            is_active: cred.is_active,
          }
        })
        setCredentials(credsMap)
      }
    } catch (error) {
      console.error("Error fetching credentials:", error)
      toast({
        variant: "destructive",
        title: "Failed to load credentials",
        description: "There was an error loading OAuth credentials.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (platform: string) => {
    setSaving(platform)
    try {
      const cred = credentials[platform]
      if (!cred || !cred.client_id || !cred.client_secret) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill in Client ID and Client Secret.",
        })
        return
      }

      const response = await fetch("/api/admin/oauth-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          client_id: cred.client_id,
          client_secret: cred.client_secret,
          redirect_uri: cred.redirect_uri || `${baseUrl}/api/platforms/oauth/${platform}/callback`,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Credentials saved!",
          description: `${PLATFORMS.find((p) => p.value === platform)?.label} credentials have been saved.`,
        })
        await fetchCredentials()
      } else {
        throw new Error(data.error || "Failed to save credentials")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message || "There was an error saving credentials.",
      })
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (platform: string) => {
    if (!window.confirm(`Are you sure you want to delete credentials for ${PLATFORMS.find((p) => p.value === platform)?.label}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/oauth-credentials?platform=${platform}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Credentials deleted",
          description: `${PLATFORMS.find((p) => p.value === platform)?.label} credentials have been removed.`,
        })
        const newCreds = { ...credentials }
        delete newCreds[platform]
        setCredentials(newCreds)
      } else {
        throw new Error("Failed to delete credentials")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: error.message || "There was an error deleting credentials.",
      })
    }
  }

  const updateCredential = (platform: string, field: keyof OAuthCredential, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        platform,
        [field]: value,
      },
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">OAuth Credentials</h1>
        <p className="text-muted-foreground text-lg">
          Configure OAuth app credentials once. All clients can then connect their accounts easily.
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-2 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            How This Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Configure OAuth credentials here once. After that, clients can simply click &quot;Connect&quot; 
            on any platform and authorize through the official OAuth flow. No setup required for clients!
          </p>
          <div className="p-3 bg-background rounded-lg text-xs space-y-1">
            <p className="font-medium">Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Get OAuth credentials from each platform&apos;s developer portal</li>
              <li>Add them here (they&apos;re encrypted and stored securely)</li>
              <li>Clients can now connect without any configuration</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Forms */}
      <div className="grid gap-6 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const cred = credentials[platform.value] || {
            platform: platform.value,
            client_id: "",
            client_secret: "",
            redirect_uri: `${baseUrl}/api/platforms/oauth/${platform.value}/callback`,
          }
          const hasCredentials = cred.client_id && cred.client_secret

          return (
            <Card key={platform.value} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{platform.label}</CardTitle>
                  {hasCredentials ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Configured
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Not Configured
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${platform.value}-client-id`}>
                    Client ID {platform.value === "tiktok" && "(Client Key)"}
                  </Label>
                  <Input
                    id={`${platform.value}-client-id`}
                    type="text"
                    placeholder={`Enter ${platform.label} Client ID`}
                    value={cred.client_id}
                    onChange={(e) => updateCredential(platform.value, "client_id", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${platform.value}-client-secret`}>Client Secret</Label>
                  <Input
                    id={`${platform.value}-client-secret`}
                    type="password"
                    placeholder="Enter Client Secret"
                    value={cred.client_secret}
                    onChange={(e) => updateCredential(platform.value, "client_secret", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${platform.value}-redirect-uri`}>Redirect URI</Label>
                  <Input
                    id={`${platform.value}-redirect-uri`}
                    type="text"
                    placeholder="Callback URL"
                    value={cred.redirect_uri}
                    onChange={(e) => updateCredential(platform.value, "redirect_uri", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set this exact URL in the platform&apos;s developer portal
                  </p>
                </div>

                <div className="flex gap-2">
                  <LoadingButton
                    onClick={() => handleSave(platform.value)}
                    loading={saving === platform.value}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {hasCredentials ? "Update" : "Save"}
                  </LoadingButton>
                  {hasCredentials && (
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(platform.value)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

