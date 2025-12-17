// lib/email/templates/testimonial-approved.tsx
// Email template when testimonial is approved (notify submitter - optional)

import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
} from '@react-email/components'

interface TestimonialApprovedEmailProps {
  workspaceName: string
  authorName: string
  publicPageUrl: string
}

export default function TestimonialApprovedEmail({
  workspaceName = 'Your Workspace',
  authorName = 'Friend',
  publicPageUrl = 'https://trustedby.app/w/example',
}: TestimonialApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your testimonial for {workspaceName} is now live!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Your Testimonial is Live!</Heading>
          
          <Text style={text}>
            Hi {authorName},
          </Text>

          <Text style={text}>
            Thank you for sharing your experience with <strong>{workspaceName}</strong>! 
            Your testimonial has been approved and is now visible to everyone.
          </Text>

          <Button style={button} href={publicPageUrl}>
            View Your Testimonial →
          </Button>

          <Text style={text}>
            We really appreciate you taking the time to share your thoughts. 
            Your feedback helps others discover {workspaceName}.
          </Text>

          <Text style={footer}>
            This email was sent by TrustedBy on behalf of {workspaceName}.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
  margin: '24px 0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '18px',
  marginTop: '32px',
  textAlign: 'center' as const,
}