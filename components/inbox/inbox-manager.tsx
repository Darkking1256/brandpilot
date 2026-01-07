"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Inbox, MessageSquare, Mail, AtSign, Reply, Check, Archive, Star, Search, MailOpen, StarOff, Twitter, Linkedin, Facebook, Instagram, Youtube, Music2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { StatsCardSkeleton } from "@/components/skeletons/card-skeleton"
import { EmptyState } from "@/components/empty-states/empty-state"

const PLATFORM_ICONS: Record<string, any> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
}

interface InboxMessage {
  id: string
  platform: string
  message_type: string
  sender_username: string
  sender_avatar_url?: string
  content: string
  is_read: boolean
  is_starred: boolean
  is_archived: boolean
  sentiment?: string
  created_at: string
}

export function InboxManager() {
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [filterPlatform, setFilterPlatform] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Calculate stats
  const stats = useMemo(() => ({
    total: messages.length,
    unread: messages.filter(m => !m.is_read).length,
    starred: messages.filter(m => m.is_starred).length,
    archived: messages.filter(m => m.is_archived).length,
  }), [messages])

  // Filter messages by search
  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages
    return messages.filter(m => 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender_username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [messages, searchQuery])

  useEffect(() => {
    fetchMessages()
  }, [filterPlatform, filterType, showUnreadOnly])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterPlatform !== "all") params.set("platform", filterPlatform)
      if (filterType !== "all") params.set("type", filterType)
      if (showUnreadOnly) params.set("read", "false")

      const response = await fetch(`/api/inbox?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Failed to fetch messages", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      const response = await fetch(`/api/inbox/${id}/mark-read`, { method: "POST" })
      if (response.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, is_read: true } : null)
        }
        toast({ title: "Marked as read" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to mark as read" })
    }
  }

  const handleToggleStar = async (id: string) => {
    const message = messages.find(m => m.id === id)
    if (!message) return
    
    try {
      const response = await fetch(`/api/inbox/${id}/star`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !message.is_starred })
      })
      if (response.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_starred: !m.is_starred } : m))
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, is_starred: !prev.is_starred } : null)
        }
        toast({ title: message.is_starred ? "Removed from starred" : "Added to starred" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update" })
    }
  }

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/inbox/${id}/archive`, { method: "POST" })
      if (response.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_archived: true } : m))
        setSelectedMessage(null)
        toast({ title: "Message archived" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to archive" })
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter a reply",
      })
      return
    }

    try {
      const response = await fetch(`/api/inbox/${selectedMessage.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      })

      if (response.ok) {
        toast({
          title: "Reply sent",
          description: "Your reply has been sent successfully.",
        })
        setReplyContent("")
        fetchMessages()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send reply",
      })
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "dm":
        return <Mail className="h-4 w-4" />
      case "mention":
        return <AtSign className="h-4 w-4" />
      default:
        return <Inbox className="h-4 w-4" />
    }
  }

  const PlatformIcon = ({ platform }: { platform: string }) => {
    const Icon = PLATFORM_ICONS[platform] || Inbox
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Inbox className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card 
            className={`border-2 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 cursor-pointer hover:shadow-lg transition-shadow ${showUnreadOnly ? "ring-2 ring-primary" : ""}`}
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <MailOpen className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.unread}</div>
              <p className="text-xs text-muted-foreground mt-1">Need attention</p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Starred</CardTitle>
              <Star className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.starred}</div>
              <p className="text-xs text-muted-foreground mt-1">Important messages</p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <Archive className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.archived}</div>
              <p className="text-xs text-muted-foreground mt-1">Cleaned up</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Messages
                {stats.unread > 0 && (
                  <Badge variant="destructive">{stats.unread}</Badge>
                )}
              </span>
            </CardTitle>
            <CardDescription>Click a message to view details</CardDescription>
            
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 mt-3">
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="dm">DMs</SelectItem>
                  <SelectItem value="mention">Mentions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant={showUnreadOnly ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                {showUnreadOnly ? "Show All" : "Unread Only"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 border rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-full mb-1" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No messages yet"
                description="Messages from your social platforms will appear here."
              />
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No messages match your search</p>
                <Button variant="link" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer hover:bg-muted transition-all ${
                    !message.is_read ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300" : ""
                  } ${selectedMessage?.id === message.id ? "border-primary ring-1 ring-primary" : ""}`}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.is_read) handleMarkRead(message.id)
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center gap-1">
                      {getMessageIcon(message.message_type)}
                      {message.is_starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm truncate ${!message.is_read ? "font-bold" : "font-medium"}`}>
                          {message.sender_username}
                        </span>
                        <Badge variant="outline" className="capitalize text-xs flex items-center gap-1">
                          <PlatformIcon platform={message.platform} />
                          {message.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), "MMM d, h:mm a")}
                        </span>
                        {message.sentiment && (
                          <Badge
                            variant={
                              message.sentiment === "positive"
                                ? "default"
                                : message.sentiment === "negative"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {message.sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMessage ? (
        <Card className="lg:col-span-2 border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getMessageIcon(selectedMessage.message_type)}
                  {selectedMessage.message_type.charAt(0).toUpperCase() +
                    selectedMessage.message_type.slice(1)}
                  {selectedMessage.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  from <span className="font-medium">{selectedMessage.sender_username}</span> on 
                  <Badge variant="outline" className="capitalize flex items-center gap-1">
                    <PlatformIcon platform={selectedMessage.platform} />
                    {selectedMessage.platform}
                  </Badge>
                </p>
              </div>
              <div className="flex gap-2">
                {!selectedMessage.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkRead(selectedMessage.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Read
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleStar(selectedMessage.id)}
                  className={selectedMessage.is_starred ? "text-yellow-600" : ""}
                >
                  {selectedMessage.is_starred ? (
                    <StarOff className="h-4 w-4" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleArchive(selectedMessage.id)}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                {format(new Date(selectedMessage.created_at), "EEEE, MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reply</label>
              <Textarea
                placeholder="Type your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
              />
              <Button onClick={handleReply} className="w-full" disabled={!replyContent.trim()}>
                <Reply className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="lg:col-span-2 border-2">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a message</p>
            <p className="text-sm">Click on a message to view details and reply</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}

