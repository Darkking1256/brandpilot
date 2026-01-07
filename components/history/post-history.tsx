"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, Clock, User, Loader2 } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PostVersion {
  id: string
  post_id: string
  content: string
  image_url?: string
  link_url?: string
  version_number: number
  created_at: string
  created_by?: string
  changes?: string
}

interface PostHistoryProps {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostHistory({ postId, open, onOpenChange }: PostHistoryProps) {
  const [versions, setVersions] = useState<PostVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && postId) {
      fetchHistory()
    }
  }, [open, postId])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/history`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data.versions || [])
      } else {
        throw new Error("Failed to fetch history")
      }
    } catch (error) {
      console.error("Failed to fetch history", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Post Edit History
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No edit history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <Card key={version.id} className={index === 0 ? "border-primary" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Version {version.version_number}
                        </span>
                        {index === 0 && (
                          <Badge variant="default" className="ml-2">
                            Current
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap mb-3">{version.content}</p>
                    {version.image_url && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">Image: </span>
                        <a
                          href={version.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {version.image_url.substring(0, 50)}...
                        </a>
                      </div>
                    )}
                    {version.link_url && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">Link: </span>
                        <a
                          href={version.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {version.link_url}
                        </a>
                      </div>
                    )}
                    {version.changes && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <strong>Note:</strong> {version.changes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

