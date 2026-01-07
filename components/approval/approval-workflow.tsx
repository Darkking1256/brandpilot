"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, MessageSquare, Clock } from "lucide-react"
import type { Post } from "@/components/posts-table"
import { useToast } from "@/hooks/use-toast"

interface ApprovalWorkflowProps {
  post: Post
  onApprove?: () => void
  onReject?: () => void
  currentUserId?: string
}

export function ApprovalWorkflow({ post, onApprove, onReject, currentUserId }: ApprovalWorkflowProps) {
  const [comment, setComment] = useState("")
  const [showComment, setShowComment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const approvalStatus = (post as any).approval_status || "draft"

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      })

      if (!response.ok) throw new Error("Failed to approve")

      toast({
        title: "Post approved",
        description: "The post has been approved and can be published.",
      })
      onApprove?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Failed to approve post",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment required",
        description: "Please provide a reason for rejection",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      })

      if (!response.ok) throw new Error("Failed to reject")

      toast({
        title: "Post rejected",
        description: "The post has been rejected and returned to draft.",
      })
      setShowComment(false)
      setComment("")
      onReject?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Rejection failed",
        description: error instanceof Error ? error.message : "Failed to reject post",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestReview = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/request-review`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to request review")

      toast({
        title: "Review requested",
        description: "The post has been submitted for review.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: error instanceof Error ? error.message : "Failed to request review",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Approval Workflow</span>
          <Badge
            variant={
              approvalStatus === "approved"
                ? "default"
                : approvalStatus === "rejected"
                ? "destructive"
                : approvalStatus === "pending_review"
                ? "secondary"
                : "outline"
            }
          >
            {approvalStatus === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {approvalStatus === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
            {approvalStatus === "pending_review" && <Clock className="h-3 w-3 mr-1" />}
            {approvalStatus.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvalStatus === "draft" && (
          <Button onClick={handleRequestReview} disabled={isSubmitting} className="w-full">
            Request Review
          </Button>
        )}

        {approvalStatus === "pending_review" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This post is awaiting approval. Review the content and approve or reject it.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1"
                variant="default"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowComment(true)}
                disabled={isSubmitting}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {approvalStatus === "approved" && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm">This post has been approved and is ready to publish.</p>
          </div>
        )}

        {approvalStatus === "rejected" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              <p className="text-sm font-semibold">This post has been rejected.</p>
            </div>
            <Button
              variant="outline"
              onClick={handleRequestReview}
              disabled={isSubmitting}
              className="w-full"
            >
              Resubmit for Review
            </Button>
          </div>
        )}

        {showComment && (
          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm font-medium">Rejection Reason</label>
            <Textarea
              placeholder="Please provide a reason for rejection..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!comment.trim() || isSubmitting}
                className="flex-1"
              >
                Submit Rejection
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowComment(false)
                  setComment("")
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

