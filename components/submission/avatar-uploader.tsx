// components/submission/avatar-uploader.tsx
// Supabase Storage version - Better for larger files

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploaderProps {
  onUpload: (url: string) => void
}

export default function AvatarUploader({ onUpload }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB')
      return
    }

    setIsUploading(true)

    try {
      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase Storage
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await supabase.storage
        .from('trustedby-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        alert('Failed to upload image. Please try again.')
        setPreview(null)
        setIsUploading(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trustedby-uploads')
        .getPublicUrl(filePath)

      onUpload(publicUrl)
      setIsUploading(false)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      setPreview(null)
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {preview && (
        <img 
          src={preview} 
          alt="Avatar preview" 
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
      )}
      
      <div>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label htmlFor="avatar-upload">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => document.getElementById('avatar-upload')?.click()}
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
                {preview ? 'Change Photo' : 'Upload Photo'}
              </>
            )}
          </Button>
        </label>
        <p className="text-xs text-gray-500 mt-1">Max 2MB</p>
      </div>
    </div>
  )
}