import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

export default function Footer() {

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Summary */}
          <div>
            <div className="footer-brand__name">Ayush Kumar</div>
            <p className="footer-brand__desc">
              Design Engineer & B.Tech Electrical Engineering graduate specializing in AutoCAD draftsmanship, solar PV layout engineering, power distribution schematics, and technical communication.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>📍 Sasaram, Bihar, India</div>
              <div>📞 <a href="tel:+919508725445" style={{ color: '#93c5fd' }}>+91 95087 25445</a></div>
              <div>✉️ <a href="mailto:ayushkumar9128750@gmail.com" style={{ color: '#93c5fd' }}>ayushkumar9128750@gmail.com</a></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="footer-heading">Navigation</div>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About & Background</Link></li>
              <li><Link to="/projects">Project Portfolio</Link></li>
              <li><Link to="/skills">Skills & Tools</Link></li>
              <li><Link to="/drawings">Technical Drawings</Link></li>
              <li><Link to="/resume">Resume & Credentials</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Professional Connect */}
          <div>
            <div className="footer-heading">Professional Links</div>
            <ul className="footer-links">
              <li>
                <a 
                  href="https://linkedin.com/in/ayush-kumar-605990259" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  LinkedIn Profile ↗
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/ayush4175kumar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  GitHub Profile ↗
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/AyushKu38914909" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  X (Twitter) Profile ↗
                </a>
              </li>
              <li>
                <Link to="/projects/commercial-rooftop-solar-pv">
                  Solar PV Case Study (119.6 kWp)
                </Link>
              </li>
              <li>
                <Link to="/projects/smart-city-lighting">
                  Smart City LED Lighting (415V)
                </Link>
              </li>
              <li>
                <Link to="/projects/content-writing">
                  Content Writing Samples
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  Request Design Consultation
                </Link>
              </li>
              <li>
                <a 
                  href="/documents/Ayush_Kumar_Resume.pdf" 
                  download="Ayush_Kumar_Resume.pdf"
                  style={{ color: '#93c5fd', fontWeight: '500' }}
                >
                  Download Resume (PDF) ↓
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {currentYear} Ayush Kumar. All rights reserved. Engineering Portfolio.
          </div>
          <div>
            Preliminary engineering portfolio demonstration — designs adhere to IS/IEC standard methodologies.
          </div>
        </div>
      </div>
    </footer>
  )
}
