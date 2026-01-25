"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Bell, Shield, CreditCard, Globe, Download, MessageSquare, Settings } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
      {/* Animated background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
          <h1 className="text-4xl font-bold text-white mb-2">
            Account <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Settings</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group",
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white shadow-lg"
                          : "text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10 hover:border-blue-500/20 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        isActive 
                          ? "bg-gradient-to-br from-blue-500 to-purple-500" 
                          : "bg-slate-700/50 group-hover:bg-gradient-to-br group-hover:from-blue-500/50 group-hover:to-purple-500/50"
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className={cn("font-medium", isActive && "text-white")}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Profile Settings
                  </h3>
                  <p className="text-slate-400">
                    Update your personal information and account details
                  </p>
                </div>
                <ProfileSettingsForm />
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    Notification Preferences
                  </h3>
                  <p className="text-slate-400">
                    Choose how you want to be notified about your campaigns and posts
                  </p>
                </div>
                <NotificationSettingsForm />
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    Security
                  </h3>
                  <p className="text-slate-400">
                    Manage your password and security settings
                  </p>
                </div>
                <PasswordSettingsForm />
              </div>
            )}

            {/* Billing Settings */}
            {activeTab === "billing" && (
              <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-md">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    Billing
                  </h3>
                  <p className="text-slate-400">
                    Manage your subscription and payment methods
                  </p>
                </div>
                <div className="text-center py-12 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <p className="text-slate-300 mb-4">
                    Billing management coming soon
                  </p>
                  <p className="text-sm text-slate-500">
                    This feature will allow you to manage your subscription, view invoices, and update payment methods.
                  </p>
                </div>
              </div>
            )}

            {/* Platform Connections */}
            {activeTab === "platforms" && (
              <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md">
                      <Link2 className="h-5 w-5 text-white" />
                    </div>
                    Platform Connections
                  </h3>
                  <p className="text-slate-400">
                    Connect your social media accounts to enable auto-publishing
                  </p>
                </div>
                <PlatformConnections />
              </div>
            )}

            {/* Comment Templates */}
            {activeTab === "templates" && (
              <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-pink-500/50 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 shadow-md">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Comment Templates
                  </h3>
                  <p className="text-slate-400">
                    Create and manage quick reply templates for comments and messages
                  </p>
                </div>
                <CommentTemplates />
              </div>
            )}

            {/* Scheduled Exports */}
            {activeTab === "exports" && (
              <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
                      <Download className="h-5 w-5 text-white" />
                    </div>
                    Scheduled Exports
                  </h3>
                  <p className="text-slate-400">
                    Manage your automated data exports
                  </p>
                </div>
                <ScheduledExports />
              </div>
            )}

            {/* Preferences Settings */}
            {activeTab === "preferences" && (
              <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-teal-500/50 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    Preferences
                  </h3>
                  <p className="text-slate-400">
                    Customize your app experience
                  </p>
                </div>
                <div className="text-center py-12 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <p className="text-slate-300 mb-4">
                    Preferences coming soon
                  </p>
                  <p className="text-sm text-slate-500">
                    This feature will allow you to customize theme, language, timezone, and other preferences.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

