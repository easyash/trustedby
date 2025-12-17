// components/scroll-to-subscription.tsx
// Client component to handle smooth scrolling to subscription section

'use client'

import { useEffect } from 'react'

export default function ScrollToSubscription() {
  useEffect(() => {
    // Check if URL has #subscription hash
    if (window.location.hash === '#subscription') {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const element = document.getElementById('subscription')
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
          })
          
          // Add a brief highlight effect
          element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-4')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-4')
          }, 2000)
        }
      }, 100)
    }
  }, [])

  return null // This component doesn't render anything
}