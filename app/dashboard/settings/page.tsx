"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Bell, Shield, CreditCard, Globe, Download, MessageSquare } from "lucide-react"
import { cn } from "@/utils/cn"
import { ProfileSettingsForm } from "@/components/forms/profile-settings-form"
import { NotificationSettingsForm } from "@/components/forms/notification-settings-form"
import { PasswordSettingsForm } from "@/components/forms/password-settings-form"
import { ScheduledExports } from "@/components/export/scheduled-exports"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformConnections } from "@/components/platforms/platform-connections"
import { Link2 } from "lucide-react"
import { CommentTemplates } from "@/components/templates/comment-templates"

type SettingsTab = "profile" | "notifications" | "security" | "billing" | "preferences" | "platforms" | "exports" | "templates"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "platforms" as const, label: "Platforms", icon: Link2 },
    { id: "templates" as const, label: "Comment Templates", icon: MessageSquare },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "exports" as const, label: "Scheduled Exports", icon: Download },
    { id: "billing" as const, label: "Billing", icon: CreditCard },
    { id: "preferences" as const, label: "Preferences", icon: Globe },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="border-2">
            <CardContent className="p-0">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-accent"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive && "text-blue-600 dark:text-blue-400")} />
                      <span className={cn("font-medium", isActive && "text-blue-700 dark:text-blue-300")}>
                        {tab.label}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettingsForm />
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Bell className="h-6 w-6 text-blue-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about your campaigns and posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettingsForm />
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordSettingsForm />
              </CardContent>
            </Card>
          )}

          {/* Billing Settings */}
          {activeTab === "billing" && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  Billing
                </CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Billing management coming soon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This feature will allow you to manage your subscription, view invoices, and update payment methods.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform Connections */}
          {activeTab === "platforms" && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Link2 className="h-6 w-6 text-blue-600" />
                  Platform Connections
                </CardTitle>
                <CardDescription>
                  Connect your social media accounts to enable auto-publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlatformConnections />
              </CardContent>
            </Card>
          )}

          {/* Comment Templates */}
          {activeTab === "templates" && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  Comment Templates
                </CardTitle>
                <CardDescription>
                  Create and manage quick reply templates for comments and messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CommentTemplates />
              </CardContent>
            </Card>
          )}

          {/* Scheduled Exports */}
          {activeTab === "exports" && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Download className="h-6 w-6 text-blue-600" />
                  Scheduled Exports
                </CardTitle>
                <CardDescription>
                  Manage your automated data exports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduledExports />
              </CardContent>
            </Card>
          )}

          {/* Preferences Settings */}
          {activeTab === "preferences" && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Preferences coming soon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This feature will allow you to customize theme, language, timezone, and other preferences.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

