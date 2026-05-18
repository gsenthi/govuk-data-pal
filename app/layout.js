export const metadata = {
  title: 'GOV.UK Data Pal',
  description: 'From insight to communication in seconds',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/govuk-frontend@5.4.0/dist/govuk/govuk-frontend.min.css"
        />
      </head>
      <body className="govuk-template__body" style={{backgroundColor: '#F4F8FB'}}>
        <a href="#main-content" className="govuk-skip-link">Skip to main content</a>
        <header className="govuk-header" role="banner" style={{backgroundColor: '#1D70B8', borderBottomColor: '#00FFE0', borderBottomWidth: '4px', borderBottomStyle: 'solid'}}>
          <div className="govuk-header__container govuk-width-container" style={{borderBottomColor: 'transparent'}}>
            <div className="govuk-header__logo">
              <a href="/" className="govuk-header__link govuk-header__link--homepage" style={{fontWeight: 'bold', fontSize: '22px', textDecoration: 'none'}}>
                GOV.UK <span style={{color: '#00FFE0'}}>·</span> Data Pal
              </a>
            </div>
          </div>
        </header>
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content">
            {children}
          </main>
        </div>
        <footer className="govuk-footer">
          <div className="govuk-width-container">
            <div className="govuk-footer__meta">
              <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
                <p className="govuk-footer__licence-description">
                  Built by Ganesh in Insights and Analytics
                </p>
              </div>
            </div>
          </div>
        </footer>
        <script src="https://unpkg.com/govuk-frontend@5.4.0/dist/govuk/govuk-frontend.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: 'window.GOVUKFrontend.initAll()'}} />
      </body>
    </html>
  )
}