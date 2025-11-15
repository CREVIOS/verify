'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, X, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { projectsApi } from '@/services/projects'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [mainDocument, setMainDocument] = useState<File | null>(null)
  const [supportingDocs, setSupportingDocs] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleMainDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setMainDocument(file)
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      })
    }
  }

  const handleSupportingDocsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const pdfFiles = files.filter(f => f.type === 'application/pdf')

    if (pdfFiles.length !== files.length) {
      toast({
        title: 'Some files were skipped',
        description: 'Only PDF files are supported',
        variant: 'default',
      })
    }

    setSupportingDocs(prev => [...prev, ...pdfFiles])
  }

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectName || !mainDocument) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide a project name and main document',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Progress indicator for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Step 1: Create project
      const project = await projectsApi.create({
        name: projectName,
        description: description || undefined,
      })

      setUploadProgress(30)

      // Step 2: Upload main document
      await projectsApi.uploadMainDocument(project.id, mainDocument)
      setUploadProgress(60)

      // Step 3: Upload supporting documents if any
      if (supportingDocs.length > 0) {
        for (let i = 0; i < supportingDocs.length; i++) {
          await projectsApi.uploadSupportingDocument(project.id, supportingDocs[i])
          setUploadProgress(60 + (30 / supportingDocs.length) * (i + 1))
        }
      }

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast({
        title: 'Project created successfully',
        description: 'Your documents have been uploaded and are being indexed',
        variant: 'default',
      })

      // Navigate to project detail page
      setTimeout(() => {
        router.push(`/dashboard/projects/${project.id}`)
      }, 1000)
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to create project. Please try again.',
        variant: 'destructive',
      })
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">New Verification Project</h1>
          <p className="mt-2 text-muted-foreground">
            Upload your IPO documents to start the verification process
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Provide basic information about your verification project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Tech Corp IPO 2024"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description for your project"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Main Document */}
          <Card>
            <CardHeader>
              <CardTitle>Main IPO Document *</CardTitle>
              <CardDescription>
                Upload the primary IPO document that will be verified
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!mainDocument ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload main document</p>
                    <p className="text-xs text-muted-foreground">PDF files only</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleMainDocUpload}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{mainDocument.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(mainDocument.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMainDocument(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>
                Upload reference documents that will be used for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Add supporting documents</p>
                  <p className="text-xs text-muted-foreground">Multiple PDF files allowed</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  multiple
                  onChange={handleSupportingDocsUpload}
                />
              </label>

              {supportingDocs.length > 0 && (
                <div className="space-y-2">
                  {supportingDocs.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSupportingDoc(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Uploading documents...</p>
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard">
              <Button type="button" variant="outline" disabled={uploading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={uploading || !projectName || !mainDocument}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
