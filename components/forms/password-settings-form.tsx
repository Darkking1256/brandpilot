"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"
import { Shield } from "lucide-react"

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface PasswordSettingsFormProps {
  onSuccess?: () => void
}

export function PasswordSettingsForm({ onSuccess }: PasswordSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: values.current_password,
          new_password: values.new_password,
          confirm_password: values.confirm_password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })

      reset()
      onSuccess?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="current_password">Current Password</Label>
        <Input
          id="current_password"
          type="password"
          placeholder="Enter your current password"
          {...register("current_password")}
          className={errors.current_password ? "border-red-500" : ""}
        />
        {errors.current_password && (
          <p className="text-sm text-red-500">{errors.current_password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new_password">New Password</Label>
        <Input
          id="new_password"
          type="password"
          placeholder="Enter your new password"
          {...register("new_password")}
          className={errors.new_password ? "border-red-500" : ""}
        />
        {errors.new_password && (
          <p className="text-sm text-red-500">{errors.new_password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters long
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm New Password</Label>
        <Input
          id="confirm_password"
          type="password"
          placeholder="Confirm your new password"
          {...register("confirm_password")}
          className={errors.confirm_password ? "border-red-500" : ""}
        />
        {errors.confirm_password && (
          <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
        )}
      </div>

      <LoadingButton
        type="submit"
        loading={isLoading}
        className="bg-gradient-to-r from-blue-600 to-cyan-600"
      >
        Update Password
      </LoadingButton>
    </form>
  )
}

