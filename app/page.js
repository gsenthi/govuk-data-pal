export default function Home() {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">

        <h1 className="govuk-heading-xl">GOV.UK Data Pal</h1>
        <p className="govuk-body-l">Turn your findings into engaging, on-brand communications in seconds.</p>

        <p className="govuk-body">Choose how you want to start:</p>

        <div className="govuk-grid-row" style={{marginTop: '30px'}}>

          <div className="govuk-grid-column-one-third">
            <div style={{background: '#f3f2f1', padding: '20px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div>
                <h2 className="govuk-heading-m">Quant data</h2>
                <p className="govuk-body-s">Enter numbers manually or upload a CSV or Excel file.</p>
              </div>
              <a href="/quant" className="govuk-button" style={{marginBottom: 0}}>Start</a>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div style={{background: '#f3f2f1', padding: '20px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div>
                <h2 className="govuk-heading-m">Qual themes</h2>
                <p className="govuk-body-s">Paste your coded themes and get a narrative and pull quotes.</p>
              </div>
              <a href="/qual" className="govuk-button" style={{marginBottom: 0}}>Start</a>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div style={{background: '#f3f2f1', padding: '20px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div>
                <h2 className="govuk-heading-m">Mixed</h2>
                <p className="govuk-body-s">Combine qual themes with quant data for a richer output.</p>
              </div>
              <a href="/mixed" className="govuk-button" style={{marginBottom: 0}}>Start</a>
            </div>
          </div>

        </div>

        <div className="govuk-warning-text" style={{marginTop: '40px'}}>
          <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            Always review AI-generated content before sharing or publishing.
          </strong>
        </div>

      </div>
    </div>
  )
}
