"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Search, Trash2, Plus, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Template {
  id: string
  name: string
  type: "post" | "campaign"
  content: any
  description?: string
  tags?: string[]
  created_at: string
}

interface TemplateLibraryProps {
  type: "post" | "campaign"
  onSelectTemplate: (template: Template) => void
  onSaveAsTemplate?: (data: any) => void
}

export function TemplateLibrary({ type, onSelectTemplate, onSaveAsTemplate }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateData, setTemplateData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [type])

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/templates?type=${type}`)
      if (!response.ok) throw new Error("Failed to fetch templates")
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateData) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a template name and ensure data is available.",
      })
      return
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          type,
          content: templateData,
          description: templateDescription || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save template")
      }

      toast({
        variant: "success",
        title: "Template saved",
        description: `"${templateName}" has been saved to your template library.`,
      })

      setIsSaveDialogOpen(false)
      setTemplateName("")
      setTemplateDescription("")
      setTemplateData(null)
      fetchTemplates()
    } catch (error: any) {
      console.error("Error saving template:", error)
      toast({
        variant: "destructive",
        title: "Failed to save template",
        description: error.message || "There was an error saving the template.",
      })
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete template")
      }

      toast({
        variant: "success",
        title: "Template deleted",
        description: "The template has been deleted successfully.",
      })

      fetchTemplates()
    } catch (error: any) {
      console.error("Error deleting template:", error)
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: error.message || "There was an error deleting the template.",
      })
    }
  }

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openSaveDialog = (data: any) => {
    setTemplateData(data)
    setIsSaveDialogOpen(true)
  }

  useEffect(() => {
    if (onSaveAsTemplate) {
      // Expose the save function to parent
      ;(onSaveAsTemplate as any).openSaveDialog = openSaveDialog
    }
  }, [onSaveAsTemplate])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Template Library</h3>
          <p className="text-sm text-muted-foreground">
            Save and reuse your {type} templates
          </p>
        </div>
        {onSaveAsTemplate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (onSaveAsTemplate) {
                openSaveDialog({})
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Save Current as Template
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No templates found.</p>
          <p className="text-sm mt-2">Create your first template to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{template.type}</Badge>
                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Save Template Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this {type} as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Product Launch Post"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this template..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} className="bg-gradient-to-r from-blue-600 to-cyan-600">
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

