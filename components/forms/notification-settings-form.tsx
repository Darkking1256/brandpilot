"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"
import { Bell } from "lucide-react"

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  sms_alerts: z.boolean(),
  weekly_digest: z.boolean(),
})

type NotificationFormValues = z.infer<typeof notificationSchema>

interface NotificationSettingsFormProps {
  onSuccess?: () => void
}

export function NotificationSettingsForm({ onSuccess }: NotificationSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { toast } = useToast()

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: true,
      push_notifications: true,
      sms_alerts: false,
      weekly_digest: true,
    },
  })

  // Load existing preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences")
        const data = await response.json()

        if (response.ok && data.preferences) {
          reset({
            email_notifications: data.preferences.email_notifications ?? true,
            push_notifications: data.preferences.push_notifications ?? true,
            sms_alerts: data.preferences.sms_alerts ?? false,
            weekly_digest: data.preferences.weekly_digest ?? true,
          })
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchPreferences()
  }, [reset])

  const onSubmit = async (values: NotificationFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update preferences")
      }

      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update preferences",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const emailNotifications = watch("email_notifications")
  const pushNotifications = watch("push_notifications")
  const smsAlerts = watch("sms_alerts")
  const weeklyDigest = watch("weekly_digest")

  if (isLoadingData) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="email_notifications" className="font-medium cursor-pointer">
            Email notifications
          </Label>
          <p className="text-sm text-muted-foreground">
            Receive email updates about your campaigns
          </p>
        </div>
        <Checkbox
          id="email_notifications"
          checked={emailNotifications}
          onCheckedChange={(checked) => {
            setValue("email_notifications", checked === true)
          }}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="push_notifications" className="font-medium cursor-pointer">
            Push notifications
          </Label>
          <p className="text-sm text-muted-foreground">
            Get real-time push notifications
          </p>
        </div>
        <Checkbox
          id="push_notifications"
          checked={pushNotifications}
          onCheckedChange={(checked) => {
            setValue("push_notifications", checked === true)
          }}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="sms_alerts" className="font-medium cursor-pointer">
            SMS alerts
          </Label>
          <p className="text-sm text-muted-foreground">
            Receive SMS for important updates
          </p>
        </div>
        <Checkbox
          id="sms_alerts"
          checked={smsAlerts}
          onCheckedChange={(checked) => {
            setValue("sms_alerts", checked === true)
          }}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="weekly_digest" className="font-medium cursor-pointer">
            Weekly digest
          </Label>
          <p className="text-sm text-muted-foreground">
            Get a weekly summary of your performance
          </p>
        </div>
        <Checkbox
          id="weekly_digest"
          checked={weeklyDigest}
          onCheckedChange={(checked) => {
            setValue("weekly_digest", checked === true)
          }}
        />
      </div>

      <LoadingButton
        type="submit"
        loading={isLoading}
        className="bg-gradient-to-r from-blue-600 to-cyan-600"
      >
        Save Preferences
      </LoadingButton>
    </form>
  )
}

