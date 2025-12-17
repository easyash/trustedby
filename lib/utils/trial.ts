// lib/utils/trial.ts
// UPDATED: Preserves ALL existing functionality + adds cancellation support

// ============================================================================
// EXISTING INTERFACES - DO NOT MODIFY (Used by existing code)
// ============================================================================

export interface TrialStatus {
  isActive: boolean
  isExpired: boolean
  isPro: boolean
  daysRemaining: number
  expiresAt: Date | null
}

// ============================================================================
// NEW INTERFACE - For enhanced cancellation support
// ============================================================================

export interface SubscriptionStatus {
  isActive: boolean
  isExpired: boolean
  isPro: boolean
  isPaid: boolean  // NEW: Added for billing page compatibility
  isTrial: boolean
  isCancelled: boolean
  isLifetime: boolean
  daysRemaining: number
  expiresAt: Date | null
  statusText: string
  canModerate: boolean
  canCreateCampaigns: boolean
  canUpdateSettings: boolean
  shouldShowUpgrade: boolean
  upgradeMessage: string | null
}

// ============================================================================
// EXISTING FUNCTIONS - PRESERVED EXACTLY AS-IS (Backward Compatible)
// ============================================================================

export function checkTrialStatus(
  subscriptionStatus: string | null,
  trialEndsAt: string | null
): TrialStatus {
  const now = new Date()
  const expiresAt = trialEndsAt ? new Date(trialEndsAt) : null

  // Pro or Lifetime user
  if (subscriptionStatus === 'active' || subscriptionStatus === 'lifetime') {
    return {
      isActive: true,
      isExpired: false,
      isPro: true,
      daysRemaining: Infinity,
      expiresAt: null,
    }
  }

  // No trial end date (shouldn't happen, but handle gracefully)
  if (!expiresAt) {
    return {
      isActive: false,
      isExpired: true,
      isPro: false,
      daysRemaining: 0,
      expiresAt: null,
    }
  }

  // Calculate days remaining
  const msRemaining = expiresAt.getTime() - now.getTime()
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))

  // Trial active
  if (msRemaining > 0) {
    return {
      isActive: true,
      isExpired: false,
      isPro: false,
      daysRemaining,
      expiresAt,
    }
  }

  // Trial expired
  return {
    isActive: false,
    isExpired: true,
    isPro: false,
    daysRemaining: 0,
    expiresAt,
  }
}

export function getTrialMessage(status: TrialStatus): string {
  if (status.isPro) {
    return 'You have full access'
  }

  if (status.isExpired) {
    return 'Your trial has expired. Upgrade to continue.'
  }

  if (status.daysRemaining <= 1) {
    return `Trial ends today! Upgrade to keep access.`
  }

  if (status.daysRemaining <= 3) {
    return `Trial ends in ${status.daysRemaining} days`
  }

  if (status.daysRemaining <= 7) {
    return `${status.daysRemaining} days left in trial`
  }

  return `Trial active (${status.daysRemaining} days remaining)`
}

export function canPerformAction(status: TrialStatus, action: string): boolean {
  // Pro users can do everything
  if (status.isPro) {
    return true
  }

  // Active trial users can do everything
  if (status.isActive) {
    return true
  }

  // Expired trial - restrict key actions
  const restrictedActions = [
    'approve_testimonial',
    'reject_testimonial',
    'delete_testimonial',
    'create_campaign',
    'update_workspace',
    'create_variant',
  ]

  return !restrictedActions.includes(action)
}

// ============================================================================
// NEW FUNCTION - Enhanced subscription status with cancellation support
// ============================================================================

export function checkSubscriptionStatus(
  subscriptionStatus: string | null,
  trialEndsAt: string | null,
  subscriptionEndsAt: string | null
): SubscriptionStatus {
  const now = new Date()
  
  // Default inactive state
  const defaultStatus: SubscriptionStatus = {
    isActive: false,
    isExpired: true,
    isPro: false,
    isPaid: false,
    isTrial: false,
    isCancelled: false,
    isLifetime: false,
    daysRemaining: 0,
    expiresAt: null,
    statusText: 'No active subscription',
    canModerate: false,
    canCreateCampaigns: false,
    canUpdateSettings: false,
    shouldShowUpgrade: true,
    upgradeMessage: 'Upgrade to Pro to unlock all features',
  }

  // Handle null subscription status
  if (!subscriptionStatus) {
    return defaultStatus
  }

  // LIFETIME - Full access forever
  if (subscriptionStatus === 'lifetime') {
    return {
      isActive: true,
      isExpired: false,
      isPro: true,
      isPaid: true,
      isTrial: false,
      isCancelled: false,
      isLifetime: true,
      daysRemaining: Infinity,
      expiresAt: null,
      statusText: 'Lifetime Access',
      canModerate: true,
      canCreateCampaigns: true,
      canUpdateSettings: true,
      shouldShowUpgrade: false,
      upgradeMessage: null,
    }
  }

  // ACTIVE PAID SUBSCRIPTION
  if (subscriptionStatus === 'active') {
    return {
      isActive: true,
      isExpired: false,
      isPro: true,
      isPaid: true,
      isTrial: false,
      isCancelled: false,
      isLifetime: false,
      daysRemaining: Infinity,
      expiresAt: null,
      statusText: 'Pro Plan Active',
      canModerate: true,
      canCreateCampaigns: true,
      canUpdateSettings: true,
      shouldShowUpgrade: false,
      upgradeMessage: null,
    }
  }

  // CANCELLED SUBSCRIPTION - Check if still in grace period
  if (subscriptionStatus === 'cancelled') {
    if (subscriptionEndsAt) {
      const endsAt = new Date(subscriptionEndsAt)
      const isStillActive = now < endsAt
      const msRemaining = endsAt.getTime() - now.getTime()
      const daysLeft = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))

      if (isStillActive) {
        // Still in paid period - full access
        return {
          isActive: true,
          isExpired: false,
          isPro: true, // Still has Pro access during grace period
          isPaid: true,
          isTrial: false,
          isCancelled: true,
          isLifetime: false,
          daysRemaining: daysLeft,
          expiresAt: endsAt,
          statusText: 'Cancelled (Access Until End Date)',
          canModerate: true,
          canCreateCampaigns: true,
          canUpdateSettings: true,
          shouldShowUpgrade: true,
          upgradeMessage: `Your subscription ends on ${endsAt.toLocaleDateString()}. Resubscribe to continue access.`,
        }
      } else {
        // Grace period ended - no access
        return {
          isActive: false,
          isExpired: true,
          isPro: false,
          isPaid: false,
          isTrial: false,
          isCancelled: true,
          isLifetime: false,
          daysRemaining: 0,
          expiresAt: endsAt,
          statusText: 'Subscription Ended',
          canModerate: false,
          canCreateCampaigns: false,
          canUpdateSettings: false,
          shouldShowUpgrade: true,
          upgradeMessage: `Your subscription ended on ${endsAt.toLocaleDateString()}. Upgrade to restore access.`,
        }
      }
    } else {
      // Cancelled but no end date - treat as expired immediately
      return {
        ...defaultStatus,
        isPaid: false,
        isCancelled: true,
        statusText: 'Subscription Cancelled',
        upgradeMessage: 'Your subscription has been cancelled. Upgrade to restore access.',
      }
    }
  }

  // TRIAL SUBSCRIPTION
  if (subscriptionStatus === 'trial') {
    if (trialEndsAt) {
      const endsAt = new Date(trialEndsAt)
      const isStillActive = now < endsAt
      const msRemaining = endsAt.getTime() - now.getTime()
      const daysLeft = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))

      if (isStillActive) {
        // Trial still active
        return {
          isActive: true,
          isExpired: false,
          isPro: false,
          isPaid: false,
          isTrial: true,
          isCancelled: false,
          isLifetime: false,
          daysRemaining: daysLeft,
          expiresAt: endsAt,
          statusText: `Trial (${daysLeft} days left)`,
          canModerate: true,
          canCreateCampaigns: true,
          canUpdateSettings: true,
          shouldShowUpgrade: daysLeft <= 7,
          upgradeMessage: daysLeft <= 3 
            ? `⚠️ Your trial expires in ${daysLeft} days! Upgrade now to keep full access.`
            : daysLeft <= 7
            ? `Your trial expires in ${daysLeft} days. Upgrade to Pro to continue.`
            : null,
        }
      } else {
        // Trial expired
        return {
          isActive: false,
          isExpired: true,
          isPro: false,
          isPaid: false,
          isTrial: true,
          isCancelled: false,
          isLifetime: false,
          daysRemaining: 0,
          expiresAt: endsAt,
          statusText: 'Trial Expired',
          canModerate: false,
          canCreateCampaigns: false,
          canUpdateSettings: false,
          shouldShowUpgrade: true,
          upgradeMessage: `Your trial expired on ${endsAt.toLocaleDateString()}. Upgrade to Pro to restore access.`,
        }
      }
    } else {
      // Trial but no end date - shouldn't happen, but treat as expired
      return {
        ...defaultStatus,
        isPaid: false,
        isTrial: true,
        statusText: 'Trial (No End Date)',
        upgradeMessage: 'Upgrade to Pro to unlock all features.',
      }
    }
  }

  // Unknown status - default to restricted
  return defaultStatus
}

// ============================================================================
// NEW HELPER - Enhanced canPerformAction with cancellation support
// ============================================================================

export function canPerformActionEnhanced(
  subscriptionStatus: string | null,
  trialEndsAt: string | null,
  subscriptionEndsAt: string | null,
  action: string
): boolean {
  const status = checkSubscriptionStatus(subscriptionStatus, trialEndsAt, subscriptionEndsAt)
  
  // If subscription is active (including cancelled but in grace period), allow everything
  if (status.isActive) {
    return true
  }

  // Otherwise, use the restriction logic
  const restrictedActions = [
    'approve_testimonial',
    'reject_testimonial',
    'delete_testimonial',
    'create_campaign',
    'update_workspace',
    'create_variant',
  ]

  return !restrictedActions.includes(action)
}