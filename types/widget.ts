// types/widget.ts
// Widget customization types - Compatible with Supabase Json

export type WidgetSettings = {
  theme: 'light' | 'dark' | 'custom'
  layout: 'grid' | 'carousel' | 'masonry' | 'list' | 'slider'
  columns: 1 | 2 | 3 | 4
  cardStyle: 'default' | 'minimal' | 'bordered' | 'elevated'
  showRating: boolean
  showAvatar: boolean
  fontFamily: 'inter' | 'system' | 'serif' | 'mono'
  fontSize: 'sm' | 'base' | 'lg'
  borderRadius: 'none' | 'sm' | 'rounded' | 'full'
  backgroundColor: string
  textColor: string
  accentColor: string
  [key: string]: string | number | boolean // Index signature for Json compatibility
}

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  theme: 'light',
  layout: 'grid',
  columns: 3,
  cardStyle: 'default',
  showRating: true,
  showAvatar: true,
  fontFamily: 'inter',
  fontSize: 'base',
  borderRadius: 'rounded',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  accentColor: '#3b82f6',
}