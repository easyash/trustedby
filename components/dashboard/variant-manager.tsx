// components/dashboard/variant-manager.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, Eye, MousePointer, BarChart } from 'lucide-react'
import { createVariant, toggleVariant, deleteVariant } from '@/app/(dashboard)/dashboard/ab-testing/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { WidgetSettings } from '@/types/widget'

interface Variant {
  id: string
  variant_name: string
  settings: WidgetSettings
  is_active: boolean
  views: number
  clicks: number
  conversion_rate: number
  created_at: string
}

interface VariantManagerProps {
  workspaceId: string
  variants: Variant[]
  defaultSettings: WidgetSettings
}

export default function VariantManager({ workspaceId, variants, defaultSettings }: VariantManagerProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateVariant = async (variantName: string, settings: Partial<WidgetSettings>) => {
    setIsCreating(true)
    
    // Merge settings safely, ensuring no undefined values
    const mergedSettings = {
      ...defaultSettings,
      ...settings,
    } as WidgetSettings
    
    const result = await createVariant(workspaceId, variantName, mergedSettings)

    if (result.success) {
      toast.success('Variant Created!', {
        description: `Variant ${variantName} has been created successfully.`,
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to create variant',
      })
    }
    setIsCreating(false)
  }

  const handleToggle = async (variantId: string, currentStatus: boolean) => {
    const result = await toggleVariant(variantId, !currentStatus)

    if (result.success) {
      toast.success('Variant Updated', {
        description: `Variant ${currentStatus ? 'disabled' : 'enabled'} successfully.`,
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to update variant',
      })
    }
  }

  const handleDelete = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return

    const result = await deleteVariant(variantId)

    if (result.success) {
      toast.success('Variant Deleted', {
        description: 'The variant has been removed successfully.',
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to delete variant',
      })
    }
  }

  // Quick variant templates
  const templates: { name: string; settings: Partial<WidgetSettings> }[] = [
    {
      name: 'Variant A (Grid)',
      settings: { layout: 'grid', columns: 3, theme: 'light' },
    },
    {
      name: 'Variant B (Carousel)',
      settings: { layout: 'carousel', columns: 3, theme: 'light' },
    },
    {
      name: 'Variant C (Slider)',
      settings: { layout: 'slider', columns: 1, theme: 'dark' },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {variants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <p className="text-2xl font-bold">
                  {variants.reduce((sum, v) => sum + v.views, 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-green-600" />
                <p className="text-2xl font-bold">
                  {variants.reduce((sum, v) => sum + v.clicks, 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Variants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-purple-600" />
                <p className="text-2xl font-bold">
                  {variants.filter(v => v.is_active).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Variant Templates */}
      {variants.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>
              Create your first variant using one of these templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Button
                  key={template.name}
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => handleCreateVariant(template.name, template.settings)}
                  disabled={isCreating}
                >
                  <p className="font-semibold mb-2">{template.name}</p>
                  <p className="text-xs text-gray-500 text-left">
                    Layout: {template.settings.layout}
                  </p>
                  <p className="text-xs text-gray-500 text-left">
                    Theme: {template.settings.theme}
                  </p>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Variants */}
      {variants.length > 0 && (
                  <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Tests</h2>
            <Link href="/dashboard/ab-testing/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Variant
              </Button>
            </Link>
          </div>

          {variants.map((variant) => (
            <Card key={variant.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{variant.variant_name}</CardTitle>
                    <CardDescription className="mt-1">
                      Layout: {variant.settings.layout} • Theme: {variant.settings.theme}
                    </CardDescription>
                  </div>
                  <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                    {variant.is_active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Views</p>
                    <p className="text-2xl font-bold">{variant.views}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Clicks</p>
                    <p className="text-2xl font-bold">{variant.clicks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CTR</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      {variant.conversion_rate}%
                      {variant.conversion_rate > 5 && (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(variant.id, variant.is_active)}
                      className="mt-1"
                    >
                      {variant.is_active ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(variant.id)}
                >
                  Delete Variant
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <BarChart className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                How A/B Testing Works
              </p>
              <p className="text-sm text-blue-800">
                Create multiple widget variants with different layouts, themes, or styles. 
                Each visitor will see a random variant, and we&apos;ll track which one performs best. 
                Use the data to optimize your testimonial widget for maximum engagement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}