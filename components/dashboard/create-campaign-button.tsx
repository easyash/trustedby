
// ===== File 1: components/dashboard/create-campaign-button.tsx =====
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CampaignModal from './campaign-modal'

export default function CreateCampaignButton({ workspaceId }: { workspaceId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Campaign
      </Button>
      {isOpen && (
        <CampaignModal 
          workspaceId={workspaceId} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  )
}