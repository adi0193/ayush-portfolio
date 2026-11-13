import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { videoScriptingData } from '../data/contentData'

export default function VideoScriptingProject() {
  const [activeTab, setActiveTab] = useState('reel') // 'reel' | 'youtube'

  const {
    title,
    toolsUsed,
    reelScript,
    youtubeScript
  } = videoScriptingData

  return (
    <div>
      <PageHero
        title={title}
        subtitle="Production-ready scripts engineered for high audience retention: a fast-paced 60-second vertical video and a structured 4-minute YouTube tutorial demystifying clean energy ROI in India."
        badge="Video Scriptwriting & Storyboarding"
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Projects', to: '/projects' },
          { label: 'YouTube & Reels Scriptwriting' }
        ]}
      />

      <div className="section">
        <div className="container">
          {/* Notice Banner */}
          <div className="notice notice--info" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong>Video Scripting Craft:</strong> Translating complex electrical engineering concepts into punchy, high-retention video formats equipped with exact timestamps, visual cues, and persuasive calls-to-action.
              </div>
              <Link to="/contact" className="btn btn--secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                Commission Video Scripts ↗
              </Link>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="detail-hero-banner">
            <img 
              src="/images/youtube-reels-scriptwriting.jpg" 
              alt="YouTube and Reels Video Scriptwriting Studio Desk with Storyboard and Microphone" 
            />
            <span className="detail-hero-caption">
              Video production desk — Scripting timeline, visual storyboarding and audio recording workflow
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
                Short-Form Format
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-navy)', margin: '0.25rem 0' }}>
                60 Seconds
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                9:16 Vertical (Reels / Shorts)
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Long-Form Format
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-blue)', margin: '0.25rem 0' }}>
                4.0 Minutes
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                16:9 Landscape YouTube Deep-Dive
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Storyboarding Detail
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-success)', margin: '0.4rem 0' }}>
                Scene-by-Scene
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                Visual directions + narration
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Workflow Stack
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-navy)', margin: '0.4rem 0' }}>
                ChatGPT + Docs
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                Pacing & Retention Engineering
              </div>
            </div>
          </div>

          {/* Script Selection Tab Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2.5rem',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: '1rem'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('reel')}
              className={`btn ${activeTab === 'reel' ? 'btn--primary' : 'btn--secondary'}`}
              style={{ fontSize: '0.95rem', padding: '0.6rem 1.5rem', borderRadius: '9999px' }}
            >
              📱 60-Second Short-Form Reel Script
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('youtube')}
              className={`btn ${activeTab === 'youtube' ? 'btn--primary' : 'btn--secondary'}`}
              style={{ fontSize: '0.95rem', padding: '0.6rem 1.5rem', borderRadius: '9999px' }}
            >
              🎥 4-Minute YouTube Deep-Dive Script
            </button>
          </div>

          {/* TAB 1: 60-Second Reel Script */}
          {activeTab === 'reel' && (
            <div>
              <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span className="badge badge--primary">9:16 Vertical Video</span>
                  <span className="badge badge--outline">Instagram Reels / YouTube Shorts</span>
                  <span className="badge badge--success">Target Runtime: 60s</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', margin: '0.25rem 0 0.5rem' }}>
                  {reelScript.title}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                  <strong>Tone & Pacing:</strong> {reelScript.tone} • <strong>Hook Strategy:</strong> {reelScript.hookStrength}
                </p>
              </div>

              {/* Hook Analysis Card */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,36,58,0.03))',
                borderLeft: '4px solid var(--color-blue)',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                  ⚡ Why This Hook Works:
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.6' }}>
                  The video opens immediately with a physical prop (electricity bill) stamped with "OVERPAYING", combining visual shock with immediate financial loss aversion in the first 2 seconds to stop mindless scrolling.
                </p>
              </div>

              {/* Table of Scenes */}
              <div className="table-responsive" style={{ marginBottom: '3.5rem' }}>
                <table className="script-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Timestamp</th>
                      <th style={{ width: '18%' }}>Scene / Phase</th>
                      <th style={{ width: '33%' }}>Visual Cue & Direction</th>
                      <th style={{ width: '34%' }}>Voice-Over (Narration)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reelScript.timeline.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="script-time-badge">{item.time}</span>
                        </td>
                        <td>
                          <div className="script-phase-title">{item.scene}</div>
                        </td>
                        <td>
                          <div className="script-visual-note">{item.visual}</div>
                        </td>
                        <td>
                          <div className="script-narration-text">"{item.narration}"</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: 4-Minute YouTube Script */}
          {activeTab === 'youtube' && (
            <div>
              <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span className="badge badge--primary">16:9 Landscape Video</span>
                  <span className="badge badge--outline">YouTube Long-Form</span>
                  <span className="badge badge--success">Runtime: ~4:00 (650 Words)</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', margin: '0.25rem 0 0.5rem' }}>
                  {youtubeScript.title}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                  <strong>Target Audience:</strong> {youtubeScript.targetAudience} • <strong>Core Takeaway:</strong> {youtubeScript.coreMessage}
                </p>
              </div>

              {/* Financial Math Highlight Box */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(5,150,105,0.06), rgba(16,36,58,0.03))',
                borderLeft: '4px solid var(--color-success)',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
                  📊 Verified Payback Model Embedded in Script:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <strong>System Size:</strong> 5 kWp On-Grid
                  </div>
                  <div>
                    <strong>Gross CapEx:</strong> ₹3,10,000
                  </div>
                  <div>
                    <strong>PM Surya Ghar Subsidy:</strong> ₹78,000
                  </div>
                  <div>
                    <strong>Net Investment:</strong> ₹2,32,000
                  </div>
                  <div>
                    <strong>Annual Generation:</strong> ~7,200 kWh
                  </div>
                  <div>
                    <strong>Calculated Payback:</strong> 4.0 Years (22%+ IRR)
                  </div>
                </div>
              </div>

              {/* Script Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '3.5rem' }}>
                {youtubeScript.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', margin: 0 }}>
                        {sec.chapter}
                      </h3>
                      <span className="script-time-badge">{sec.timestamp}</span>
                    </div>

                    <div style={{
                      background: 'var(--color-bg-alt)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--color-blue)',
                      fontSize: '0.85rem',
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                      marginBottom: '1.25rem'
                    }}>
                      🎬 <strong>Visual & B-Roll Cue:</strong> {sec.visualCue}
                    </div>

                    <div style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.8',
                      color: 'var(--color-text)',
                      whiteSpace: 'pre-line'
                    }}>
                      {sec.dialogue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retention Architecture & Methodology */}
          <div className="card" style={{ padding: '2rem', marginBottom: '3.5rem', background: 'var(--color-bg)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
              Scripting Methodology & Storyboard Production
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Unlike generic scripts generated by copy-paste prompting, these scripts follow behavioral retention curves: visual pattern interrupts every 12-15 seconds, concrete mathematical examples instead of vague generalizations, and transparent disclosures compliant with Indian renewable energy norms.
            </p>

            <div className="tools-showcase-grid">
              {toolsUsed.map((tool, idx) => (
                <div key={idx} className="tool-showcase-card">
                  <div className="tool-name">{tool}</div>
                  <div className="tool-role">Hook testing, speech pacing & overlay design</div>
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
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Explore Product Review Benchmark:</div>
              <Link to="/projects/inverter-comparison-review" style={{ fontWeight: '600', color: 'var(--color-navy)', fontSize: '1.1rem' }}>
                ← Sungrow vs Huawei Inverter Review
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/contact" className="btn btn--primary">
                Commission Video Scripting →
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
