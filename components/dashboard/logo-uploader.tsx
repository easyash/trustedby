// components/dashboard/logo-uploader.tsx 
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadLogo } from '@/app/(dashboard)/dashboard/settings/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface LogoUploaderProps {
  workspaceId: string
  currentLogoUrl?: string
}

export default function LogoUploader({ workspaceId, currentLogoUrl }: LogoUploaderProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Error', {
        description: 'Please upload an image file',
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Error', {
        description: 'Image must be smaller than 2MB',
      })
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('workspaceId', workspaceId)

    const result = await uploadLogo(formData)

    if (result.success) {
      toast.success('Logo Updated!', {
        description: 'Your workspace logo has been updated successfully.',
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to upload logo',
      })
      setPreview(currentLogoUrl || null)
    }
    setIsUploading(false)
  }

  const handleRemove = async () => {
    setPreview(null)
    // TODO: Implement logo deletion if needed
    toast.success('Logo Removed', {
      description: 'Your workspace logo has been removed.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Logo</CardTitle>
        <CardDescription>
          Upload a logo for your testimonial wall and emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="Logo preview" 
                className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
              />
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}

          <div className="flex-1">
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <label htmlFor="logo-upload">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => document.getElementById('logo-upload')?.click()}
                className="cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {preview ? 'Change Logo' : 'Upload Logo'}
                  </>
                )}
              </Button>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Recommended: Square image, max 2MB (PNG, JPG, SVG)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}