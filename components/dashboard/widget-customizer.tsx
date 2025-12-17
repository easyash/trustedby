// components/dashboard/widget-customizer.tsx
// Widget customization UI

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { updateWidgetSettings } from '@/app/(dashboard)/dashboard/embed/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { WidgetSettings } from '@/types/widget'

interface WidgetCustomizerProps {
  workspaceId: string
  initialSettings: WidgetSettings
}

export default function WidgetCustomizer({ workspaceId, initialSettings }: WidgetCustomizerProps) {
  const router = useRouter()
  const [settings, setSettings] = useState<WidgetSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateWidgetSettings(workspaceId, settings)

    if (result.success) {
      toast.success('Settings Saved', {
        description: 'Widget customization updated successfully.',
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
    <Card>
      <CardHeader>
        <CardTitle>Widget Customization</CardTitle>
        <CardDescription>
          Customize how your testimonials look on your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layout */}
        <div className="space-y-2">
          <Label>Layout</Label>
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
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Columns (for grid/masonry) */}
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

        {/* Theme */}
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

        {/* Card Style */}
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

        {/* Font Family */}
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

        {/* Font Size */}
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

        {/* Border Radius */}
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

        {/* Colors (for custom theme) */}
        {settings.theme === 'custom' && (
          <>
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
          </>
        )}

        {/* Toggle Options */}
        <div className="space-y-3">
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
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Customization'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}