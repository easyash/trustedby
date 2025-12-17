// components/dashboard/settings-forms.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { updateWorkspaceSettings, updateProfileSettings } from '@/app/(dashboard)/dashboard/settings/actions'
import { toast } from 'sonner'

interface WorkspaceFormProps {
  workspace: any
}

export function WorkspaceSettingsForm({ workspace }: WorkspaceFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateWorkspaceSettings(workspace.id, formData)

    if (result.success) {
      toast.success('Settings Saved', {
        description: 'Your workspace settings have been updated.',
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to save settings',
      })
    }

    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workspace Name</Label>
        <Input 
          id="name"
          name="name"
          defaultValue={workspace.name}
          placeholder="My Awesome Company"
          required
        />
        <p className="text-xs text-gray-500">
          This name appears on your public Wall of Love page
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Public URL Slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {process.env.NEXT_PUBLIC_APP_URL || 'https://trustedby.app'}/w/
          </span>
          <Input 
            id="slug"
            name="slug"
            defaultValue={workspace.slug}
            placeholder="my-company"
            className="flex-1"
            required
            pattern="[a-z0-9-]+"
            title="Only lowercase letters, numbers, and hyphens"
          />
        </div>
        <p className="text-xs text-gray-500">
          This determines your public Wall of Love URL
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">Website URL (Optional)</Label>
        <Input 
          id="website_url"
          name="website_url"
          defaultValue={workspace.website_url || ''}
          placeholder="https://mycompany.com"
          type="url"
        />
        <p className="text-xs text-gray-500">
          Link shown on your public Wall of Love page
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_color">Brand Color</Label>
        <div className="flex items-center gap-2">
          <Input 
            id="brand_color"
            name="brand_color"
            type="color"
            defaultValue={workspace.brand_color}
            className="w-20 h-10 cursor-pointer"
            required
          />
          <Input 
            value={workspace.brand_color}
            placeholder="#3B82F6"
            className="flex-1 font-mono"
            readOnly
          />
        </div>
        <p className="text-xs text-gray-500">
          Used for accents on your Wall of Love and submission form
        </p>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}

interface ProfileFormProps {
  customer: any
}

export function ProfileSettingsForm({ customer }: ProfileFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfileSettings(formData)

    if (result.success) {
      toast.success('Profile Updated', {
        description: 'Your profile has been updated.',
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to update profile',
      })
    }

    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          type="email"
          defaultValue={customer?.email || ''}
          disabled
        />
        <p className="text-xs text-gray-500">
          Email cannot be changed
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile_name">Name</Label>
        <Input 
          id="profile_name"
          name="name"
          defaultValue={customer?.name || ''}
          placeholder="Your Name"
          required
        />
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Update Profile'
          )}
        </Button>
      </div>
    </form>
  )
}