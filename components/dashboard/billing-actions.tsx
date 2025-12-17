// components/dashboard/billing-actions.tsx
// Client component for billing actions (update payment, cancel, download)

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cancelSubscription } from '@/app/(dashboard)/dashboard/settings/billing/actions'
import UpdatePaymentModal from './update-payment-modal'

interface BillingActionsProps {
  action: 'update-payment' | 'cancel' | 'download'
  subscriptionId?: string
  invoiceId?: string
  invoiceData?: {
    amount: number
    date: string
    status: string
  }
}

export default function BillingActions({ 
  action, 
  subscriptionId,
  invoiceId,
  invoiceData 
}: BillingActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  // Update Payment Method
  const handleUpdatePayment = () => {
    setShowUpdateModal(true)
  }

  // Cancel Subscription
  const handleCancel = async () => {
    const confirmed = confirm(
      'Are you sure you want to cancel your subscription?\n\n' +
      'You\'ll retain access until the end of your current billing period, ' +
      'but your subscription will not renew.'
    )

    if (!confirmed) return

    setIsLoading(true)

    const result = await cancelSubscription()

    if (result.success) {
      toast.success('Subscription Cancelled', {
        description: 'Your subscription will end at the end of this billing period.',
      })
      router.refresh()
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to cancel subscription',
      })
    }

    setIsLoading(false)
  }

  // Download Invoice
  const handleDownload = () => {
    if (!invoiceData) {
      toast.error('Error', {
        description: 'Invoice data not available',
      })
      return
    }

    setIsLoading(true)

    try {
      // Generate invoice PDF/HTML content
      const invoiceHTML = generateInvoiceHTML(invoiceData, invoiceId || '')
      
      // Create blob and download
      const blob = new Blob([invoiceHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceId}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Invoice Downloaded', {
        description: 'Your invoice has been downloaded successfully.',
      })
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Error', {
        description: 'Failed to download invoice',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Render appropriate button based on action
  if (action === 'update-payment') {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={handleUpdatePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Update
            </>
          )}
        </Button>

        <UpdatePaymentModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          subscriptionId={subscriptionId || ''}
        />
      </>
    )
  }

  if (action === 'cancel') {
    return (
      <Button 
        variant="destructive" 
        onClick={handleCancel}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Cancelling...
          </>
        ) : (
          'Cancel Subscription'
        )}
      </Button>
    )
  }

  if (action === 'download') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDownload}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download
          </>
        )}
      </Button>
    )
  }

  return null
}

// Generate invoice HTML
function generateInvoiceHTML(invoice: any, invoiceId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice #${invoiceId}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #3b82f6;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-number {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f9fafb;
      font-weight: 600;
    }
    .total {
      text-align: right;
      font-size: 20px;
      font-weight: bold;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #3b82f6;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background-color: #dcfce7;
      color: #166534;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">TrustedBy</div>
      <p>Testimonial Collection Platform</p>
    </div>
    <div class="invoice-details">
      <div class="invoice-number">Invoice #${invoiceId}</div>
      <div>Date: ${new Date(invoice.date).toLocaleDateString()}</div>
      <div class="status">${invoice.status.toUpperCase()}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Bill To</div>
    <p>
      TrustedBy Customer<br>
      Email: customer@example.com
    </p>
  </div>

  <div class="section">
    <div class="section-title">Invoice Details</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>TrustedBy Pro Subscription</td>
          <td>1</td>
          <td>$${invoice.amount.toFixed(2)}</td>
          <td>$${invoice.amount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="total">
    Total: $${invoice.amount.toFixed(2)} USD
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>TrustedBy • https://trustedby.co • support@trustedby.co</p>
  </div>
</body>
</html>
  `.trim()
}