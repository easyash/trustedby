// app/widget/route.ts
// Enhanced widget with Carousel, Masonry, Slider, A/B testing

import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  const widgetCode = `
/**
 * TrustedBy Widget v3.0 - Enhanced with Slider & A/B Testing
 */

(function() {
  'use strict';
  
  const CONFIG = {
    API_URL: '${process.env.NEXT_PUBLIC_APP_URL}/api/widget',
    ANALYTICS_URL: '${process.env.NEXT_PUBLIC_APP_URL}/api/widget-analytics',
    CONTAINER_ID: 'trustedby-widget',
  };
  
  const FONTS = {
    inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "'Georgia', 'Times New Roman', serif",
    mono: "'Courier New', Courier, monospace",
  };
  
  const THEMES = {
    light: { bg: '#ffffff', text: '#1f2937', accent: '#3b82f6', cardBg: '#f9fafb' },
    dark: { bg: '#1f2937', text: '#f9fafb', accent: '#60a5fa', cardBg: '#374151' },
  };
  
  let currentSlideIndex = 0;
  let autoSlideInterval = null;
  
  function getWorkspaceId() {
    const scripts = document.querySelectorAll('script[src*="widget"]');
    for (let script of scripts) {
      const id = script.getAttribute('data-workspace-id');
      if (id) return id;
    }
    return null;
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function getStyles(settings) {
    const theme = settings.theme === 'custom' ? {
      bg: settings.backgroundColor,
      text: settings.textColor,
      accent: settings.accentColor,
      cardBg: settings.backgroundColor,
    } : THEMES[settings.theme] || THEMES.light;
    
    const borderRadius = {
      none: '0',
      sm: '4px',
      rounded: '12px',
      full: '9999px',
    }[settings.borderRadius] || '12px';
    
    const fontSize = {
      sm: { base: '14px', heading: '16px' },
      base: { base: '15px', heading: '18px' },
      lg: { base: '16px', heading: '20px' },
    }[settings.fontSize] || { base: '15px', heading: '18px' };
    
    return { theme, borderRadius, fontSize };
  }
  
  function createCard(testimonial, settings) {
    const { theme, borderRadius, fontSize } = getStyles(settings);
    const fontFamily = FONTS[settings.fontFamily] || FONTS.inter;
    
    const cardStyles = {
      default: \`box-shadow: 0 1px 3px rgba(0,0,0,0.1);\`,
      minimal: \`border: 1px solid \${theme.accent}20;\`,
      bordered: \`border: 2px solid \${theme.accent};\`,
      elevated: \`box-shadow: 0 10px 25px rgba(0,0,0,0.15);\`,
    }[settings.cardStyle] || '';
    
    return \`
      <div class="trustedby-card" style="
        background: \${theme.cardBg};
        border-radius: \${borderRadius};
        padding: 1.5rem;
        \${cardStyles}
        font-family: \${fontFamily};
        color: \${theme.text};
        transition: transform 0.3s ease;
      ">
        \${settings.showRating && testimonial.rating ? \`
          <div style="display: flex; gap: 4px; margin-bottom: 12px;">
            \${[...Array(5)].map((_, i) => \`
              <span style="color: \${i < testimonial.rating ? '#fbbf24' : '#d1d5db'}; font-size: 18px;">★</span>
            \`).join('')}
          </div>
        \` : ''}
        
        <p style="
          font-style: italic;
          margin-bottom: 1rem;
          line-height: 1.6;
          font-size: \${fontSize.base};
        ">
          "\${escapeHtml(testimonial.content)}"
        </p>
        
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid \${theme.accent}20;
        ">
          \${settings.showAvatar ? \`
            \${testimonial.author_avatar_url ? \`
              <img src="\${testimonial.author_avatar_url}" 
                   style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" 
                   alt="\${escapeHtml(testimonial.author_name)}" />
            \` : \`
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, \${theme.accent}, \${theme.accent}80);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
              ">
                \${testimonial.author_name.charAt(0).toUpperCase()}
              </div>
            \`}
          \` : ''}
          
          <div style="flex: 1; min-width: 0;">
            <p style="font-weight: 600; font-size: \${fontSize.heading}; margin: 0;">
              \${escapeHtml(testimonial.author_name)}
            </p>
            \${testimonial.author_title ? \`
              <p style="font-size: \${fontSize.base}; opacity: 0.7; margin: 0;">
                \${escapeHtml(testimonial.author_title)}
                \${testimonial.author_company ? ' • ' + escapeHtml(testimonial.author_company) : ''}
              </p>
            \` : ''}
          </div>
        </div>
      </div>
    \`;
  }
  
  function createSlider(testimonials, settings) {
    const { theme } = getStyles(settings);
    
    return \`
      <div class="trustedby-slider" style="position: relative; overflow: hidden;">
        <div class="trustedby-slider-track" style="
          display: flex;
          transition: transform 0.5s ease;
        ">
          \${testimonials.map(t => createCard(t, settings)).join('')}
        </div>
        
        <button class="trustedby-prev" style="
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: \${theme.accent};
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 20px;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">‹</button>
        
        <button class="trustedby-next" style="
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: \${theme.accent};
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 20px;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">›</button>
        
        <div class="trustedby-dots" style="
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        ">
          \${testimonials.map((_, i) => \`
            <button class="trustedby-dot" data-index="\${i}" style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              border: none;
              background: \${i === 0 ? theme.accent : theme.accent + '40'};
              cursor: pointer;
            "></button>
          \`).join('')}
        </div>
      </div>
    \`;
  }
  
  function initSlider(testimonials, settings) {
    const track = document.querySelector('.trustedby-slider-track');
    const prevBtn = document.querySelector('.trustedby-prev');
    const nextBtn = document.querySelector('.trustedby-next');
    const dots = document.querySelectorAll('.trustedby-dot');
    
    function updateSlide(index) {
      currentSlideIndex = index;
      track.style.transform = \`translateX(-\${index * 100}%)\`;
      
      dots.forEach((dot, i) => {
        dot.style.background = i === index ? 
          getStyles(settings).theme.accent : 
          getStyles(settings).theme.accent + '40';
      });
    }
    
    prevBtn.addEventListener('click', () => {
      const newIndex = currentSlideIndex === 0 ? testimonials.length - 1 : currentSlideIndex - 1;
      updateSlide(newIndex);
    });
    
    nextBtn.addEventListener('click', () => {
      const newIndex = (currentSlideIndex + 1) % testimonials.length;
      updateSlide(newIndex);
    });
    
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => updateSlide(i));
    });
    
    // Auto-slide every 5 seconds
    autoSlideInterval = setInterval(() => {
      const newIndex = (currentSlideIndex + 1) % testimonials.length;
      updateSlide(newIndex);
    }, 5000);
  }
  
  function getLayoutStyles(settings) {
    const columns = settings.columns || 3;
    
    if (settings.layout === 'slider') {
      return \`
        .trustedby-slider-track .trustedby-card {
          min-width: 100%;
          flex-shrink: 0;
        }
      \`;
    }
    
    if (settings.layout === 'carousel') {
      return \`
        .trustedby-container {
          display: flex;
          overflow-x: auto;
          gap: 1.5rem;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        .trustedby-card {
          flex: 0 0 calc(100% / \${Math.min(columns, 3)} - 1rem);
          scroll-snap-align: start;
        }
        @media (max-width: 768px) {
          .trustedby-card { flex: 0 0 calc(100% - 1rem); }
        }
      \`;
    }
    
    if (settings.layout === 'masonry') {
      return \`
        .trustedby-container {
          column-count: \${columns};
          column-gap: 1.5rem;
        }
        .trustedby-card {
          break-inside: avoid;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) {
          .trustedby-container { column-count: 1; }
        }
      \`;
    }
    
    if (settings.layout === 'list') {
      return \`
        .trustedby-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }
      \`;
    }
    
    // Default: grid
    return \`
      .trustedby-container {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(\${columns}, 1fr);
      }
      @media (max-width: 1024px) {
        .trustedby-container { grid-template-columns: repeat(\${Math.min(columns, 2)}, 1fr); }
      }
      @media (max-width: 640px) {
        .trustedby-container { grid-template-columns: 1fr; }
      }
    \`;
  }
  
  function trackEvent(workspaceId, variantId, eventType) {
    fetch(\`\${CONFIG.ANALYTICS_URL}/track\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        variant_id: variantId,
        event_type: eventType,
        session_id: getSessionId(),
      }),
    }).catch(() => {});
  }
  
  function getSessionId() {
    let sid = sessionStorage.getItem('trustedby_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('trustedby_sid', sid);
    }
    return sid;
  }
  
  async function renderWidget() {
    const workspaceId = getWorkspaceId();
    const container = document.getElementById(CONFIG.CONTAINER_ID);
    
    if (!workspaceId || !container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:20px;color:#666;">Loading testimonials...</p>';
    
    try {
      const response = await fetch(\`\${CONFIG.API_URL}/\${workspaceId}\`);
      const { testimonials, settings, variant_id } = await response.json();
      
      if (!testimonials || testimonials.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">No testimonials yet.</p>';
        return;
      }
      
      // Track widget view
      if (variant_id) {
        trackEvent(workspaceId, variant_id, 'view');
      }
      
      const layoutStyles = getLayoutStyles(settings);
      
      if (settings.layout === 'slider') {
        container.innerHTML = \`
          <style>
            \${layoutStyles}
            .trustedby-card:hover { transform: translateY(-4px); }
          </style>
          \${createSlider(testimonials, settings)}
        \`;
        initSlider(testimonials, settings);
      } else {
        const cardsHtml = testimonials.map(t => createCard(t, settings)).join('');
        container.innerHTML = \`
          <style>
            \${layoutStyles}
            .trustedby-card:hover { transform: translateY(-4px); }
          </style>
          <div class="trustedby-container">
            \${cardsHtml}
          </div>
        \`;
      }
      
      // Track clicks
      container.addEventListener('click', (e) => {
        if (e.target.closest('.trustedby-card') && variant_id) {
          trackEvent(workspaceId, variant_id, 'click');
        }
      });
      
    } catch (error) {
      console.error('[TrustedBy] Error:', error);
      container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:20px;">Failed to load testimonials.</p>';
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderWidget);
  } else {
    renderWidget();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
  });
})();
`;

  return new NextResponse(widgetCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
    },
  });
}