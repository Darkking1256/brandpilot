"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Copy, Calendar, Clock, History } from "lucide-react"
import { format } from "date-fns"

export interface Post {
  id: string
  content: string
  platform: string
  scheduledDate: string
  scheduledTime: string
  status: "draft" | "scheduled" | "published" | "failed"
  imageUrl?: string
  linkUrl?: string
  createdAt: string
}

interface PostsTableProps {
  posts: Post[]
  onEdit?: (post: Post) => void
  onDelete?: (postId: string) => void
  onDuplicate?: (post: Post) => void
  onViewHistory?: (postId: string) => void
  onSelectionChange?: (selectedIds: string[]) => void
  selectedIds?: string[]
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const platformColors: Record<string, string> = {
  twitter: "bg-blue-500",
  linkedin: "bg-blue-600",
  facebook: "bg-blue-700",
  instagram: "bg-pink-500",
  tiktok: "bg-black",
}

export function PostsTable({ 
  posts, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onViewHistory,
  onSelectionChange,
  selectedIds = []
}: PostsTableProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds)

  useEffect(() => {
    setInternalSelectedIds(selectedIds)
  }, [selectedIds])

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? posts.map(p => p.id) : []
    setInternalSelectedIds(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleSelectOne = (postId: string, checked: boolean) => {
    const newSelection = checked
      ? [...internalSelectedIds, postId]
      : internalSelectedIds.filter(id => id !== postId)
    setInternalSelectedIds(newSelection)
    onSelectionChange?.(newSelection)
  }

  const allSelected = posts.length > 0 && internalSelectedIds.length === posts.length
  const someSelected = internalSelectedIds.length > 0 && internalSelectedIds.length < posts.length

  const getStatusBadge = (status: Post["status"]) => {
    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPlatformBadge = (platform: string) => {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${platformColors[platform] || "bg-gray-500"}`} />
        <span className="capitalize">{platform}</span>
      </div>
    )
  }

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`)
      return format(dateTime, "MMM dd, yyyy 'at' h:mm a")
    } catch {
      return `${date} at ${time}`
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="w-[300px]">Content</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No posts found.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Checkbox
                    checked={internalSelectedIds.includes(post.id)}
                    onCheckedChange={(checked) => handleSelectOne(post.id, checked as boolean)}
                    aria-label={`Select post ${post.id}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px]">
                    <p className="font-medium truncate">{post.content}</p>
                    {post.imageUrl && (
                      <span className="text-xs text-muted-foreground">Has image</span>
                    )}
                    {post.linkUrl && (
                      <span className="text-xs text-muted-foreground ml-2">Has link</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getPlatformBadge(post.platform)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDateTime(post.scheduledDate, post.scheduledTime)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(post.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(post)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(post)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onViewHistory && (
                        <DropdownMenuItem onClick={() => onViewHistory(post.id)}>
                          <History className="mr-2 h-4 w-4" />
                          View History
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(post.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

