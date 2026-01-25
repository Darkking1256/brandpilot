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
          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Total Messages</span>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
                <Inbox className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>
          <div 
            className={`p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer ${showUnreadOnly ? "border-red-500/50 ring-2 ring-red-500/30" : "border-slate-700/50 hover:border-red-500/50"}`}
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Unread</span>
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
                <MailOpen className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.unread}</div>
            <p className="text-xs text-slate-500 mt-1">Need attention</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Starred</span>
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 shadow-md">
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.starred}</div>
            <p className="text-xs text-slate-500 mt-1">Important messages</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-slate-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Archived</span>
              <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 shadow-md">
                <Archive className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.archived}</div>
            <p className="text-xs text-slate-500 mt-1">Cleaned up</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-xl font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                Messages
                {stats.unread > 0 && (
                  <Badge variant="destructive">{stats.unread}</Badge>
                )}
              </span>
            </h3>
            <p className="text-slate-400 text-sm mt-1">Click a message to view details</p>
            
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 mt-3">
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="flex-1 bg-slate-800/50 border-slate-700/50 text-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
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
                <SelectTrigger className="flex-1 bg-slate-800/50 border-slate-700/50 text-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
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
                className={`flex-1 ${showUnreadOnly ? "bg-gradient-to-r from-blue-600 to-cyan-600" : "border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white"}`}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                {showUnreadOnly ? "Show All" : "Unread Only"}
              </Button>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 border border-slate-700/50 rounded-lg animate-pulse bg-slate-800/30">
                    <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-700/50 rounded w-full mb-1" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400 font-medium">No messages yet</p>
                <p className="text-slate-500 text-sm">Messages from your social platforms will appear here.</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">No messages match your search</p>
                <Button variant="link" onClick={() => setSearchQuery("")} className="text-blue-400">
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${
                    !message.is_read 
                      ? "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20" 
                      : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                  } ${selectedMessage?.id === message.id ? "border-blue-500 ring-1 ring-blue-500/50" : ""}`}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.is_read) handleMarkRead(message.id)
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      {getMessageIcon(message.message_type)}
                      {message.is_starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm truncate ${!message.is_read ? "font-bold text-white" : "font-medium text-slate-300"}`}>
                          {message.sender_username}
                        </span>
                        <Badge variant="outline" className="capitalize text-xs flex items-center gap-1 border-slate-600 text-slate-400">
                          <PlatformIcon platform={message.platform} />
                          {message.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
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
          </div>
        </div>

      {selectedMessage ? (
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-slate-400">{getMessageIcon(selectedMessage.message_type)}</span>
                  {selectedMessage.message_type.charAt(0).toUpperCase() +
                    selectedMessage.message_type.slice(1)}
                  {selectedMessage.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                </h3>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  from <span className="font-medium text-white">{selectedMessage.sender_username}</span> on 
                  <Badge variant="outline" className="capitalize flex items-center gap-1 border-slate-600 text-slate-400">
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
                    className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Read
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleStar(selectedMessage.id)}
                  className={`border-slate-700/50 bg-slate-800/50 hover:text-white ${selectedMessage.is_starred ? "text-yellow-500" : "text-slate-300"}`}
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
                  className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <p className="whitespace-pre-wrap text-slate-300">{selectedMessage.content}</p>
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700/50">
                {format(new Date(selectedMessage.created_at), "EEEE, MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Reply</label>
              <Textarea
                placeholder="Type your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
              <Button onClick={handleReply} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" disabled={!replyContent.trim()}>
                <Reply className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6">
            <MessageSquare className="h-16 w-16 mb-4 text-slate-600" />
            <p className="text-lg font-medium text-slate-400">Select a message</p>
            <p className="text-sm text-slate-500">Click on a message to view details and reply</p>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

