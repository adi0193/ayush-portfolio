import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SlideCarouselViewer from '../components/SlideCarouselViewer'
import { socialCarouselData } from '../data/contentData'

export default function SocialCarouselProject() {
  const [copied, setCopied] = useState(false)

  const {
    title,
    toolsUsed,
    slides,
    captionCopy,
    hashtags,
    designSystem
  } = socialCarouselData

  const handleCopyCaption = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(captionCopy + '\n\n' + hashtags.join(' '))
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div>
      <PageHero
        title={title}
        subtitle="A 5-slide educational social media carousel engineered for high retention, deconstructing the 5 biggest rooftop solar traps before investing in India."
        badge="Social Media Content Design"
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Projects', to: '/projects' },
          { label: 'Social Media Carousel' }
        ]}
      />

      <div className="section">
        <div className="container">
          {/* Notice Banner */}
          <div className="notice notice--info" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong>Design & Content Deliverable:</strong> Complete multi-slide visual sequence crafted in Canva with research-backed engineering tips, optimized caption, hashtag strategy, and brand design tokens.
              </div>
              <Link to="/contact" className="btn btn--secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                Hire for Content Design ↗
              </Link>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="detail-hero-banner">
            <img 
              src="/images/solar-social-carousel-design.jpg" 
              alt="5-Slide Educational Solar Energy Instagram Carousel Canva Workstation" 
            />
            <span className="detail-hero-caption">
              Canva workstation view — 5-slide 4:5 carousel sequence and brand tokens
            </span>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Platform
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-navy)', margin: '0.4rem 0' }}>
                Instagram & LinkedIn
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                Multi-Slide Carousel
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Aspect Ratio
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-blue)', margin: '0.25rem 0' }}>
                4:5 Portrait
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                1080 × 1350 px Screen Real Estate
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Slide Count
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-success)', margin: '0.25rem 0' }}>
                5 Slides
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                Hook, 3 Traps, Checklist CTA
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Core Tools
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-navy)', margin: '0.4rem 0' }}>
                Canva + ChatGPT
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                Layout, Typography & Copy
              </div>
            </div>
          </div>

          {/* Section 1: Interactive Slide Carousel Viewer */}
          <div style={{ marginBottom: '4rem' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <span className="badge badge--primary" style={{ marginBottom: '0.5rem' }}>
                Interactive Preview
              </span>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', margin: '0.25rem 0 0.5rem' }}>
                Interactive 5-Slide Carousel Walkthrough
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                Click through the sequence below to inspect slide layout, content pacing, engineering takeaway boxes, and call-to-actions.
              </p>
            </div>

            <SlideCarouselViewer slides={slides} />
          </div>

          {/* Section 2: Social Media Caption & Distribution Pack */}
          <div style={{ marginBottom: '4rem' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <span className="badge badge--outline" style={{ marginBottom: '0.5rem' }}>
                Copywriting & Distribution
              </span>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', margin: '0.25rem 0 0.5rem' }}>
                Social Caption & Targeted Hashtag Strategy
              </h2>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Post Caption (LinkedIn / Instagram)
                </span>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="btn btn--secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  {copied ? '✓ Copied to Clipboard!' : '📋 Copy Caption + Tags'}
                </button>
              </div>

              <div style={{
                background: 'var(--color-bg)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-family)',
                fontSize: '0.95rem',
                lineHeight: '1.75',
                color: 'var(--color-text)',
                whiteSpace: 'pre-line',
                marginBottom: '1.5rem'
              }}>
                {captionCopy}
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Targeted Hashtag Clusters
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'var(--color-blue-subtle)',
                        color: 'var(--color-blue)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Canva Design System & Visual Tokens */}
          <div style={{ marginBottom: '4rem' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <span className="badge badge--success" style={{ marginBottom: '0.5rem' }}>
                Canva Design System
              </span>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', margin: '0.25rem 0 0.5rem' }}>
                Color Palette, Typography & Layout Guidelines
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Color Swatches */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '1rem' }}>
                  Branding Color Palette
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {designSystem.palette.map((c, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: c.hex,
                        border: c.hex === '#FFFFFF' ? '1px solid var(--color-border)' : 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        flexShrink: 0
                      }} />
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--color-navy)', fontSize: '0.9rem' }}>
                          {c.name} <code style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginLeft: '0.25rem' }}>{c.hex}</code>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                          {c.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography & Layout Rules */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '1rem' }}>
                  Typography Hierarchy & Margins
                </h4>
                
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                    Font Pairings
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-navy)', marginTop: '0.25rem' }}>
                    {designSystem.fonts}
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                    Safe Zone & Grid Rule
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginTop: '0.25rem' }}>
                    {designSystem.gridRule}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                    Engagement Architecture
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginTop: '0.25rem' }}>
                    Slide 1 uses curiosity hook ("5 Traps"); Slides 2-4 deliver dense, high-credibility engineering rules; Slide 5 provides a bookmark-worthy action checklist to maximize algorithmic save rates.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="card" style={{ padding: '2rem', marginBottom: '3.5rem', background: 'var(--color-bg)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
              Creative Workflow Tools
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              How Canva and AI tools were synchronized to deliver production-grade social assets quickly:
            </p>

            <div className="tools-showcase-grid">
              {toolsUsed.map((tool, idx) => (
                <div key={idx} className="tool-showcase-card">
                  <div className="tool-name">{tool}</div>
                  <div className="tool-role">Copy ideation, visual styling & graphic design</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Next Project in Content & Media:</div>
              <Link to="/projects/youtube-reels-script-writing" style={{ fontWeight: '600', color: 'var(--color-navy)', fontSize: '1.1rem' }}>
                YouTube & Reels Script Writing →
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/contact" className="btn btn--primary">
                Hire for Social Media Design →
              </Link>
              <Link to="/projects" className="btn btn--secondary">
                All Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
