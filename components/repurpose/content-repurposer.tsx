"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingButton } from "@/components/loading-button"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Copy, Check, Save, FileText, Upload, AlertCircle, Twitter, Linkedin, Facebook, Instagram, Youtube, Music2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatePostFormWithInitialData } from "./create-post-form-wrapper"

const PLATFORMS = [
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "text-sky-500", charLimit: 280 },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700", charLimit: 3000 },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600", charLimit: 63206 },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500", charLimit: 2200 },
  { value: "tiktok", label: "TikTok", icon: Music2, color: "text-black dark:text-white", charLimit: 2200 },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "text-red-600", charLimit: 5000 },
] as const

export function ContentRepurposer() {
  const [content, setContent] = useState("")
  const [sourcePlatform, setSourcePlatform] = useState<string>("other")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [preserveTone, setPreserveTone] = useState(true)
  const [isRepurposing, setIsRepurposing] = useState(false)
  const [repurposedContent, setRepurposedContent] = useState<Record<string, string>>({})
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [postToCreate, setPostToCreate] = useState<{ content: string; platform: string } | null>(null)
  const { toast } = useToast()

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const handleRepurpose = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Please enter or paste content to repurpose.",
      })
      return
    }

    if (selectedPlatforms.length === 0) {
      toast({
        variant: "destructive",
        title: "Platforms required",
        description: "Please select at least one target platform.",
      })
      return
    }

    setIsRepurposing(true)
    try {
      const response = await fetch("/api/ai/repurpose-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          targetPlatforms: selectedPlatforms,
          sourcePlatform,
          preserveTone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to repurpose content")
      }

      setRepurposedContent(data.repurposed)
      toast({
        title: "Content repurposed!",
        description: `Successfully adapted content for ${selectedPlatforms.length} platform(s).`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to repurpose content",
      })
    } finally {
      setIsRepurposing(false)
    }
  }

  const handleCopy = async (platform: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPlatform(platform)
      toast({
        title: "Copied!",
        description: `${platform} content copied to clipboard.`,
      })
      setTimeout(() => setCopiedPlatform(null), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
      })
    }
  }

  const handleSaveAsPost = (platform: string, content: string) => {
    setPostToCreate({ content, platform })
    setIsCreatePostOpen(true)
  }

  const handlePostCreated = () => {
    setIsCreatePostOpen(false)
    setPostToCreate(null)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Input Content</TabsTrigger>
          <TabsTrigger value="results" disabled={Object.keys(repurposedContent).length === 0}>
            Repurposed Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Original Content</CardTitle>
              <CardDescription>
                Paste or type your content to repurpose for different platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source-platform">Source Platform (Optional)</Label>
                <Select value={sourcePlatform} onValueChange={setSourcePlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Original Content</SelectItem>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".txt,.md,.doc,.docx"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            const text = await file.text()
                            setContent(text)
                            toast({
                              title: "File loaded",
                              description: `Loaded content from ${file.name}`,
                            })
                          } catch (error) {
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description: "Failed to read file",
                            })
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    {content && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setContent("")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="content"
                  placeholder="Paste your content here... (blog post, social media post, article, etc.)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length.toLocaleString()} characters
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Target Platforms</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPlatforms(PLATFORMS.map(p => p.value))}
                      className="text-xs h-7"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPlatforms([])}
                      className="text-xs h-7"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon
                    return (
                      <div
                        key={platform.value}
                        className={`flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-accent cursor-pointer transition-all ${
                          selectedPlatforms.includes(platform.value) 
                            ? "border-primary bg-primary/5" 
                            : "border-muted"
                        }`}
                        onClick={() => handlePlatformToggle(platform.value)}
                      >
                        <Checkbox
                          checked={selectedPlatforms.includes(platform.value)}
                          onCheckedChange={() => handlePlatformToggle(platform.value)}
                        />
                        <Icon className={`h-4 w-4 ${platform.color}`} />
                        <div className="flex-1">
                          <Label className="cursor-pointer text-sm">{platform.label}</Label>
                          <p className="text-xs text-muted-foreground">{platform.charLimit.toLocaleString()} chars</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserve-tone"
                  checked={preserveTone}
                  onCheckedChange={(checked) => setPreserveTone(checked === true)}
                />
                <Label htmlFor="preserve-tone" className="cursor-pointer">
                  Preserve original tone and style
                </Label>
              </div>

              <LoadingButton
                onClick={handleRepurpose}
                loading={isRepurposing}
                disabled={!content.trim() || selectedPlatforms.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Repurpose Content
              </LoadingButton>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {Object.entries(repurposedContent).map(([platform, text]) => {
            const platformData = PLATFORMS.find((p) => p.value === platform)
            const platformLabel = platformData?.label || platform
            const Icon = platformData?.icon || FileText
            const charLimit = platformData?.charLimit || 5000
            const isOverLimit = text.length > charLimit
            const charPercentage = Math.min((text.length / charLimit) * 100, 100)
            
            return (
              <Card key={platform} className={`border-2 ${isOverLimit ? "border-red-300" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <Icon className={`h-5 w-5 ${platformData?.color || ""}`} />
                      </div>
                      <CardTitle className="text-lg">{platformLabel}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(platform, text)}
                      >
                        {copiedPlatform === platform ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSaveAsPost(platform, text)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save as Post
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{text}</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isOverLimit ? "text-red-600 font-medium flex items-center gap-1" : "text-muted-foreground"}>
                        {isOverLimit && <AlertCircle className="h-3 w-3" />}
                        {text.length.toLocaleString()} / {charLimit.toLocaleString()} characters
                      </span>
                      {isOverLimit && (
                        <span className="text-red-600 font-medium">
                          {(text.length - charLimit).toLocaleString()} over limit
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isOverLimit ? "bg-red-500" : charPercentage > 80 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${charPercentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Create Post Modal */}
      {postToCreate && (
        <CreatePostFormWithInitialData
          open={isCreatePostOpen}
          onOpenChange={(open) => {
            setIsCreatePostOpen(open)
            if (!open) setPostToCreate(null)
          }}
          initialContent={postToCreate.content}
          initialPlatform={postToCreate.platform as any}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  )
}

