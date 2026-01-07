"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, Image as ImageIcon, Video, File, X, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface MediaAsset {
  id: string
  file_name: string
  file_url: string
  file_type: "image" | "video" | "document"
  tags: string[]
  description?: string
  created_at: string
  width?: number
  height?: number
}

interface MediaLibraryProps {
  onSelect?: (asset: MediaAsset) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MediaLibrary({ onSelect, open, onOpenChange }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video" | "document">("all")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, string>>({})
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/media")
      if (response.ok) {
        const data = await response.json()
        setAssets(data.assets || [])
      }
    } catch (error) {
      console.error("Failed to fetch assets", error)
    }
  }

  const handleUpload = async (files: FileList) => {
    setIsUploading(true)
    const fileArray = Array.from(files)
    
    // Initialize progress tracking for each file
    const progress: Record<string, number> = {}
    const fileNames: Record<string, string> = {}
    fileArray.forEach((file) => {
      const fileId = `${file.name}-${Date.now()}-${Math.random()}`
      progress[fileId] = 0
      fileNames[fileId] = file.name
    })
    setUploadProgress(progress)
    setUploadingFiles(fileNames)

    // Upload files individually to track progress
    const uploadPromises = fileArray.map(async (file, index) => {
      const fileId = Object.keys(fileNames)[index]
      const formData = new FormData()
      formData.append("file", file)

      try {
        // Simulate progress (in real implementation, use XMLHttpRequest for actual progress)
        setUploadProgress(prev => ({ ...prev, [fileId]: 25 }))
        
        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        })

        setUploadProgress(prev => ({ ...prev, [fileId]: 75 }))

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        const data = await response.json()
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        
        // Clean up progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev }
            delete updated[fileId]
            return updated
          })
          setUploadingFiles(prev => {
            const updated = { ...prev }
            delete updated[fileId]
            return updated
          })
        }, 1000)

        return data.assets?.[0] || null
      } catch (error) {
        setUploadProgress(prev => {
          const updated = { ...prev }
          delete updated[fileId]
          return updated
        })
        setUploadingFiles(prev => {
          const updated = { ...prev }
          delete updated[fileId]
          return updated
        })
        throw error
      }
    })

    try {
      const results = await Promise.allSettled(uploadPromises)
      const successful = results.filter(r => r.status === "fulfilled" && r.value !== null)
      const failed = results.filter(r => r.status === "rejected")

      if (successful.length > 0) {
        const newAssets = successful.map(r => (r as PromiseFulfilledResult<MediaAsset>).value).filter(Boolean)
        setAssets((prev) => [...prev, ...newAssets])
      }

      if (failed.length > 0) {
        toast({
          variant: "destructive",
          title: "Some uploads failed",
          description: `${failed.length} file(s) failed to upload. ${successful.length} file(s) uploaded successfully.`,
        })
      } else if (successful.length > 0) {
        toast({
          title: "Upload successful",
          description: `${successful.length} file(s) uploaded`,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
      })
    } finally {
      setIsUploading(false)
      // Clear any remaining progress after delay
      setTimeout(() => {
        setUploadProgress({})
        setUploadingFiles({})
      }, 2000)
    }
  }

  const handleDelete = async (assetId: string) => {
    try {
      const response = await fetch(`/api/media/${assetId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      setAssets((prev) => prev.filter((a) => a.id !== assetId))
      toast({
        title: "Asset deleted",
        description: "The asset has been removed",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete asset",
      })
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || asset.file_type === selectedType
    return matchesSearch && matchesType
  })

  const content = (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Media Library</CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? `Uploading... (${Object.keys(uploadProgress).length})` : "Upload"}
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </CardHeader>
      <CardContent>
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
          <TabsList>
            <TabsTrigger value="all">All ({assets.length})</TabsTrigger>
            <TabsTrigger value="image">
              <ImageIcon className="h-4 w-4 mr-2" />
              Images ({assets.filter((a) => a.file_type === "image").length})
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-2" />
              Videos ({assets.filter((a) => a.file_type === "video").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Upload Progress Indicators */}
        {Object.keys(uploadingFiles).length > 0 && (
          <div className="space-y-2 mb-4">
            {Object.entries(uploadingFiles).map(([fileId, fileName]) => (
              <div key={fileId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{fileName}</span>
                  <span className="ml-2">{uploadProgress[fileId] || 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[fileId] || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAssets.length === 0 && Object.keys(uploadingFiles).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No assets found</p>
            <p className="text-sm mt-2">Upload files to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="relative group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedAsset(asset)
                  onSelect?.(asset)
                }}
              >
                {asset.file_type === "image" ? (
                  <img
                    src={asset.file_url}
                    alt={asset.file_name}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                ) : asset.file_type === "video" ? (
                  <div className="w-full h-32 bg-muted flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center">
                    <File className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect?.(asset)
                      onOpenChange?.(false)
                    }}
                  >
                    Select
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(asset.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2 bg-background">
                  <p className="text-xs truncate font-medium">{asset.file_name}</p>
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {asset.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {asset.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{asset.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Media Library</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return content
}

