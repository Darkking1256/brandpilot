"use client"

import { CreatePostForm } from "@/components/forms/create-post-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPostPage() {
  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex items-center gap-3 md:hidden">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Create Post</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
        <p className="text-muted-foreground mt-1">Schedule content across your social platforms</p>
      </div>

      <Card>
        <CardHeader className="hidden md:block">
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Fill in the details below to schedule your post
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 md:pt-0">
          <CreatePostForm inline />
        </CardContent>
      </Card>
    </div>
  )
}

