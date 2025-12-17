// lib/email/templates/testimonial-submitted.tsx
// Email template when a testimonial is submitted (notify workspace owner)

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
  Section,
  Button,
} from '@react-email/components'

interface TestimonialSubmittedEmailProps {
  workspaceName: string
  authorName: string
  content: string
  moderationUrl: string
}

export default function TestimonialSubmittedEmail({
  workspaceName = 'Your Workspace',
  authorName = 'Anonymous',
  content = 'Great product!',
  moderationUrl = 'https://trustedby.app/dashboard/testimonials/moderation',
}: TestimonialSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New testimonial submitted for {workspaceName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 New Testimonial Submitted!</Heading>
          
          <Text style={text}>
            Great news! Someone just shared their experience with <strong>{workspaceName}</strong>.
          </Text>

          <Section style={testimonialBox}>
            <Text style={testimonialAuthor}>From: {authorName}</Text>
            <Text style={testimonialContent}>"{content}"</Text>
          </Section>

          <Text style={text}>
            This testimonial is waiting for your review. You can approve or reject it from your dashboard.
          </Text>

          <Button style={button} href={moderationUrl}>
            Review Testimonial →
          </Button>

          <Text style={footer}>
            This email was sent by TrustedBy. You're receiving this because you own the workspace "{workspaceName}".
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

const testimonialBox = {
  backgroundColor: '#f3f4f6',
  border: '2px solid #e5e7eb',
  borderLeft: '4px solid #3b82f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const testimonialAuthor = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const testimonialContent = {
  color: '#1f2937',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '24px',
  margin: '0',
}

const button = {
  backgroundColor: '#3b82f6',
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