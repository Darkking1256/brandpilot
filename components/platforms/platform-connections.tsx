"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Link2, ExternalLink, AlertCircle, XCircle } from "lucide-react"

interface PlatformConnection {
  id: string
  platform: string
  platform_username?: string
  platform_user_id?: string
  is_active: boolean
  last_used_at?: string
  created_at: string
}

const PLATFORMS = [
  { value: "twitter", label: "Twitter/X", icon: "🐦" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "facebook", label: "Facebook", icon: "📘" },
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "youtube", label: "YouTube", icon: "📺" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
] as const

export function PlatformConnections() {
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState<string | null>(null)
  const [platformStatus, setPlatformStatus] = useState<Record<string, { configured: boolean; missing: string[] }>>({})
  const { toast } = useToast()

  const fetchConnections = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/platforms")
      const data = await response.json()

      if (response.ok) {
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPlatformStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/platforms/status")
      const data = await response.json()
      if (response.ok && data.platforms) {
        const statusMap: Record<string, { configured: boolean; missing: string[] }> = {}
        Object.entries(data.platforms).forEach(([key, platform]: [string, any]) => {
          statusMap[key] = {
            configured: platform.configured,
            missing: platform.missing || [],
          }
        })
        setPlatformStatus(statusMap)
      }
    } catch (error) {
      console.error("Error fetching platform status:", error)
    }
  }, [])

  useEffect(() => {
    fetchConnections()
    fetchPlatformStatus()
    
    // Check for OAuth callback success/error messages
    const urlParams = new URLSearchParams(window.location.search)
    const platform = urlParams.get("platform")
    const connected = urlParams.get("connected")
    const error = urlParams.get("error")

    if (platform) {
      if (connected === "true") {
        toast({
          title: "Platform connected!",
          description: `${PLATFORMS.find((p) => p.value === platform)?.label} has been connected successfully.`,
        })
        fetchConnections()
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname)
      } else if (error) {
        const decodedError = decodeURIComponent(error)
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: `Failed to connect ${PLATFORMS.find((p) => p.value === platform)?.label}: ${decodedError}`,
        })
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname)
      }
    }
  }, [fetchConnections, fetchPlatformStatus, toast])

  const handleConnect = (platform: string) => {
    // Redirect to OAuth flow - each user will authorize and get their own token
    window.location.href = `/api/platforms/oauth/${platform}`
  }

  const handleTest = async (platform: string) => {
    setIsTesting(platform)
    try {
      const response = await fetch("/api/platforms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Connection verified",
          description: `${PLATFORMS.find((p) => p.value === platform)?.label} connection is working.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: data.message || "Failed to verify connection",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Test failed",
        description: error instanceof Error ? error.message : "Failed to test connection",
      })
    } finally {
      setIsTesting(null)
    }
  }

  const getPlatformInfo = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform) || {
      value: platform,
      label: platform,
      icon: "🔗",
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Connections</h2>
          <p className="text-muted-foreground">
            Connect your social media accounts to enable auto-publishing. Each user gets their own access token through OAuth.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const connection = connections.find((c) => c.platform === platform.value)
          const isConnected = !!connection && connection.is_active

          return (
            <Card key={platform.value} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{platform.label}</CardTitle>
                      {connection?.platform_username && (
                        <CardDescription>@{connection.platform_username}</CardDescription>
                      )}
                    </div>
                  </div>
                  {isConnected ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : platformStatus[platform.value]?.configured ? (
                    <Badge variant="outline">Ready to Connect</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Configured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="space-y-3">
                    {connection.platform_username && (
                      <p className="text-sm text-muted-foreground">
                        Connected as: @{connection.platform_username}
                      </p>
                    )}
                    {connection.last_used_at && (
                      <p className="text-sm text-muted-foreground">
                        Last used: {new Date(connection.last_used_at).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(platform.value)}
                        disabled={isTesting === platform.value}
                      >
                        {isTesting === platform.value ? "Testing..." : "Test Connection"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect(platform.value)}
                      >
                        Reconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {platformStatus[platform.value]?.configured ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Connect your {platform.label} account to enable auto-publishing
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleConnect(platform.value)}
                          className="w-full"
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Connect {platform.label}
                        </Button>
                      </>
                    ) : platformStatus[platform.value]?.configured ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Connect your {platform.label} account to enable auto-publishing
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleConnect(platform.value)}
                          className="w-full"
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Connect {platform.label}
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          OAuth credentials not configured for {platform.label}
                        </p>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded text-xs">
                          <p className="font-medium mb-1">Admin Setup Required:</p>
                          <p className="text-muted-foreground">
                            Platform owner needs to configure OAuth credentials in{" "}
                            <a href="/dashboard/admin/oauth-credentials" className="text-blue-600 hover:underline font-medium">
                              Admin → OAuth Credentials
                            </a>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConnect(platform.value)}
                          className="w-full"
                          disabled
                          variant="outline"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Not Configured
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Simply click &quot;Connect&quot; for any platform. You&apos;ll be redirected to authorize the app, 
            then redirected back. Your access token will be securely stored automatically.
          </p>
          <div className="p-3 bg-background rounded-lg">
            <p className="text-xs font-medium mb-2">For Platform Owners:</p>
            <p className="text-xs text-muted-foreground mb-2">
              OAuth credentials need to be configured once in{" "}
              <a href="/dashboard/admin/oauth-credentials" className="text-blue-600 hover:underline font-medium">
                Admin → OAuth Credentials
              </a>
              . After that, all clients can connect without any setup!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

