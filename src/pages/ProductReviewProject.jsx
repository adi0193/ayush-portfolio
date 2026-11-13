import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { inverterReviewData } from '../data/contentData'

export default function ProductReviewProject() {
  const {
    title,
    subtitle,
    toolsUsed,
    verdictSummary,
    specsComparison,
    sungrowReview,
    huaweiReview,
    buyerGuidance
  } = inverterReviewData

  return (
    <div>
      <PageHero
        title={title}
        subtitle={subtitle}
        badge="Product Review & Technical Benchmark"
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Projects', to: '/projects' },
          { label: 'Inverter Review & Comparison' }
        ]}
      />

      <div className="section">
        <div className="container">
          {/* Context Notice */}
          <div className="notice notice--info" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong>Technical Review Objective:</strong> Evaluating two tier-1 commercial string inverters across MPPT configuration, thermal derating in Indian climates (&gt;45°C), safety protections, and CAPEX payback.
              </div>
              <Link to="/contact" className="btn btn--secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                Inquire on Inverter Sizing ↗
              </Link>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="detail-hero-banner">
            <img 
              src="/images/inverter-comparison-review.jpg" 
              alt="Sungrow SG110CX vs Huawei SUN2000-100KTL Commercial Solar Inverter Comparison" 
            />
            <span className="detail-hero-caption">
              Comparative benchmark — Commercial rooftop string inverter hardware & monitoring architecture
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
                Sungrow Capacity
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-navy)', margin: '0.25rem 0' }}>
                110 kW
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                9 MPPTs / 18 Inputs
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Huawei Capacity
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-blue)', margin: '0.25rem 0' }}>
                100 kW
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                10 MPPTs / 20 Inputs
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Peak Efficiency
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-success)', margin: '0.25rem 0' }}>
                98.8%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                European Euro-Eff 98.6%
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                CapEx Delta (India)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-warning)', margin: '0.4rem 0' }}>
                8–12% Sungrow
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                Lower upfront cost per watt
              </div>
            </div>
          </div>

          {/* Executive Verdict Box */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,36,58,0.03))',
            borderLeft: '4px solid var(--color-blue)',
            padding: '1.75rem',
            marginBottom: '3.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🏆</span>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', margin: 0 }}>
                Executive Engineering Verdict
              </h3>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--color-text)', lineHeight: '1.7', margin: 0 }}>
              {verdictSummary}
            </p>
          </div>

          {/* Section 1: Side-by-Side 10-Point Technical Spec Matrix */}
          <div style={{ marginBottom: '4rem' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <span className="badge badge--primary" style={{ marginBottom: '0.5rem' }}>
                Engineering Comparison Matrix
              </span>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', margin: '0.25rem 0 0.5rem' }}>
                Head-to-Head Technical Specification Audit
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                Verified against official manufacturer datasheets, C&I grid compliance guidelines, and rooftop thermal derating curves.
              </p>
            </div>

            <div className="table-responsive">
              <table className="spec-comparison-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Technical Parameter</th>
                    <th style={{ width: '27%' }}>Sungrow SG110CX</th>
                    <th style={{ width: '27%' }}>Huawei SUN2000-100KTL</th>
                    <th style={{ width: '16%' }}>Advantage / Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {specsComparison.map((row, idx) => {
                    const isSungrow = row.winner.includes('Sungrow')
                    const isHuawei = row.winner.includes('Huawei')
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600', color: 'var(--color-navy)' }}>
                          {row.parameter}
                        </td>
                        <td style={{
                          fontWeight: isSungrow ? '600' : '400',
                          color: isSungrow ? 'var(--color-navy)' : 'var(--color-text)'
                        }}>
                          {row.sungrow}
                        </td>
                        <td style={{
                          fontWeight: isHuawei ? '600' : '400',
                          color: isHuawei ? 'var(--color-navy)' : 'var(--color-text)'
                        }}>
                          {row.huawei}
                        </td>
                        <td>
                          <span className={`badge ${
                            isSungrow ? 'badge--primary' : isHuawei ? 'badge--info' : 'badge--outline'
                          }`}>
                            {row.winner}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Deep Dive Pros & Cons Cards */}
          <div style={{ marginBottom: '4rem' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <span className="badge badge--outline" style={{ marginBottom: '0.5rem' }}>
                Detailed Inverter Analysis
              </span>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', margin: '0.25rem 0 0.5rem' }}>
                Strengths, Trade-Offs & Architectural Considerations
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {/* Sungrow Card */}
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', margin: 0 }}>
                    {sungrowReview.name}
                  </h3>
                  <span className="badge badge--primary">110 kW Commercial</span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Key Advantages
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                    {sungrowReview.pros.map((pro, pIdx) => (
                      <li key={pIdx} style={{ marginBottom: '0.5rem' }}>{pro}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Engineering Limitations
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                    {sungrowReview.cons.map((con, cIdx) => (
                      <li key={cIdx} style={{ marginBottom: '0.5rem' }}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Huawei Card */}
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', margin: 0 }}>
                    {huaweiReview.name}
                  </h3>
                  <span className="badge badge--info">100 kW Commercial</span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Key Advantages
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                    {huaweiReview.pros.map((pro, pIdx) => (
                      <li key={pIdx} style={{ marginBottom: '0.5rem' }}>{pro}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Engineering Limitations
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                    {huaweiReview.cons.map((con, cIdx) => (
                      <li key={cIdx} style={{ marginBottom: '0.5rem' }}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Buyer & EPC Guidance Matrix */}
          <div style={{ marginBottom: '4rem' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <span className="badge badge--success" style={{ marginBottom: '0.5rem' }}>
                Selection Guide
              </span>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', margin: '0.25rem 0 0.5rem' }}>
                EPC Decision Matrix: When to Specify Which Unit
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {buyerGuidance.map((guide, gIdx) => (
                <div key={gIdx} className="card" style={{
                  padding: '1.75rem',
                  borderTop: gIdx === 0 ? '4px solid var(--color-blue)' : '4px solid var(--color-navy)'
                }}>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '1rem' }}>
                    {guide.scenario}
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                    {guide.points.map((pt, ptIdx) => (
                      <li key={ptIdx} style={{ marginBottom: '0.75rem' }}>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Writing Methodology & Tools */}
          <div className="card" style={{ padding: '2rem', marginBottom: '3.5rem', background: 'var(--color-bg)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
              Engineering Review Methodology & Tools Used
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Authored with data extracted from manufacturer technical datasheets, warranty documents, and IEC 62109 compliance tests. Structured into reader-friendly comparative matrices using modern desktop publishing and editing tools.
            </p>

            <div className="tools-showcase-grid">
              {toolsUsed.map((tool, idx) => (
                <div key={idx} className="tool-showcase-card">
                  <div className="tool-name">{tool}</div>
                  <div className="tool-role">Datasheet research, technical structuring & layout</div>
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
              <Link to="/projects/social-media-carousel-design" style={{ fontWeight: '600', color: 'var(--color-navy)', fontSize: '1.1rem' }}>
                Social Media Carousel Design (Solar Traps) →
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/contact" className="btn btn--primary">
                Consult on Engineering Specs →
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
