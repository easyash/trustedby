// components/dashboard/create-variant-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { createVariant } from '@/app/(dashboard)/dashboard/ab-testing/actions'
import { toast } from 'sonner'
import type { WidgetSettings } from '@/types/widget'
import Link from 'next/link'

interface CreateVariantFormProps {
  workspaceId: string
  defaultSettings: any
}

export default function CreateVariantForm({ workspaceId, defaultSettings }: CreateVariantFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [variantName, setVariantName] = useState('')
  const [settings, setSettings] = useState<WidgetSettings>(defaultSettings)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!variantName.trim()) {
      toast.error('Error', {
        description: 'Please enter a variant name',
      })
      return
    }

    setIsSubmitting(true)

    const result = await createVariant(workspaceId, variantName, settings)

    if (result.success) {
      toast.success('Variant Created!', {
        description: `${variantName} has been created successfully.`,
      })
      router.push('/dashboard/ab-testing')
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to create variant',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/ab-testing">
        <Button type="button" variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to A/B Testing
        </Button>
      </Link>

      {/* Variant Name */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Information</CardTitle>
          <CardDescription>
            Give your variant a descriptive name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Variant Name</Label>
            <Input
              id="name"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="e.g., Variant A - Dark Theme Carousel"
              required
            />
            <p className="text-sm text-gray-500">
              This name helps you identify this variant in analytics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Configuration</CardTitle>
          <CardDescription>
            Choose how testimonials are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Layout Type</Label>
            <Select
              value={settings.layout}
              onValueChange={(value: any) => setSettings({ ...settings, layout: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
                <SelectItem value="masonry">Masonry</SelectItem>
                <SelectItem value="slider">Slider</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(settings.layout === 'grid' || settings.layout === 'masonry') && (
            <div className="space-y-2">
              <Label>Columns</Label>
              <Select
                value={settings.columns.toString()}
                onValueChange={(value) => setSettings({ ...settings, columns: parseInt(value) as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Theme & Style</CardTitle>
          <CardDescription>
            Customize the visual appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: any) => setSettings({ ...settings, theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Card Style</Label>
            <Select
              value={settings.cardStyle}
              onValueChange={(value: any) => setSettings({ ...settings, cardStyle: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="bordered">Bordered</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Select
              value={settings.borderRadius}
              onValueChange={(value: any) => setSettings({ ...settings, borderRadius: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Typography Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>
            Configure text appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value: any) => setSettings({ ...settings, fontFamily: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter (Sans-serif)</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="mono">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: any) => setSettings({ ...settings, fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="base">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
          <CardDescription>
            Choose what to show or hide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Show Rating Stars</Label>
            <input
              type="checkbox"
              checked={settings.showRating}
              onChange={(e) => setSettings({ ...settings, showRating: e.target.checked })}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Author Avatar</Label>
            <input
              type="checkbox"
              checked={settings.showAvatar}
              onChange={(e) => setSettings({ ...settings, showAvatar: e.target.checked })}
              className="w-4 h-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors (if custom theme) */}
      {settings.theme === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Colors</CardTitle>
            <CardDescription>
              Define your own color scheme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Variant...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Variant
            </>
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/dashboard/ab-testing')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}