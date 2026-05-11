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
      <body className="govuk-template__body">
        <a href="#main-content" className="govuk-skip-link">Skip to main content</a>
        <header className="govuk-header" role="banner">
          <div className="govuk-header__container govuk-width-container">
            <div className="govuk-header__logo">
              <a href="/" className="govuk-header__link govuk-header__link--homepage">
                <svg
                  focusable="false"
                  className="govuk-header__logotype"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 148 30"
                  height="30"
                  width="148"
                  aria-label="GOV.UK"
                >
                  <title>GOV.UK</title>
                  <path d="M22.6 10.4c-1 .4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m-5.9 6.7c-.9.4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m17.3-1.7c-.9.4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m-13.4-5.3c-.9.4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m-7.6 5.3c-.9.4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m7.6 0c-.9.4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4M1.5 25.8C.7 25 0 24 0 22.7V5c0-1 .5-2 1.2-2.7L1 2l13.3 13.3-1.3 1.3L1.5 25.8zm7.3 2.4l-2-2 7.7-7.7 2 2-7.7 7.7zm10-2.7l-7.3-7.3L23 6.5l7.3 7.3-11.5 11.7zM30 5L16.7 18.3 15.4 17 28.6 3.8 30 5z"/>
                </svg>
                <span className="govuk-header__logotype-text"> GOV.UK</span>
              </a>
            </div>
            <div className="govuk-header__content">
              <a href="/" className="govuk-header__link govuk-header__service-name">
                Data Pal
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
                  Built with the GOV.UK Design System
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
