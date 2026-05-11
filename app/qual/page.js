'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Qual() {
  const router = useRouter()
  const [themes, setThemes] = useState([{ theme: '', description: '', frequency: '' }])
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)

  function addTheme() {
    setThemes(t => [...t, { theme: '', description: '', frequency: '' }])
  }

  function removeTheme(i) {
    setThemes(t => t.filter((_, idx) => idx !== i))
  }

  function updateTheme(i, field, val) {
    setThemes(t => {
      const updated = [...t]
      updated[i] = { ...updated[i], [field]: val }
      return updated
    })
  }

  async function handleSubmit() {
    setLoading(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'qual', data: themes, context })
    })
    const json = await res.json()
    if (json.success) {
      sessionStorage.setItem('datapal_result', JSON.stringify(json.result))
      sessionStorage.setItem('datapal_data', JSON.stringify(themes))
      sessionStorage.setItem('datapal_type', 'qual')
      router.push('/output')
    } else {
      alert('Error: ' + json.error)
      setLoading(false)
    }
  }

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <a href="/" className="govuk-back-link">Back</a>
        <h1 className="govuk-heading-xl">Qual themes</h1>
        <p className="govuk-body">Enter your coded themes below. Add as many as you need.</p>

        {themes.map((t, i) => (
          <div key={i} style={{background: '#f3f2f1', padding: '20px', marginBottom: '16px'}}>
            <h2 className="govuk-heading-s">Theme {i + 1}</h2>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`theme-${i}`}>Theme name</label>
              <input
                className="govuk-input"
                id={`theme-${i}`}
                value={t.theme}
                onChange={e => updateTheme(i, 'theme', e.target.value)}
                placeholder="e.g. Lack of trust in the system"
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`desc-${i}`}>Description or example verbatim</label>
              <textarea
                className="govuk-textarea"
                id={`desc-${i}`}
                rows="3"
                value={t.description}
                onChange={e => updateTheme(i, 'description', e.target.value)}
                placeholder="e.g. Participants described feeling confused by the process and unsure who to trust."
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`freq-${i}`}>Frequency (optional)</label>
              <div className="govuk-hint">How many participants mentioned this theme?</div>
              <input
                className="govuk-input govuk-input--width-5"
                id={`freq-${i}`}
                value={t.frequency}
                onChange={e => updateTheme(i, 'frequency', e.target.value)}
                placeholder="e.g. 12"
              />
            </div>

            {themes.length > 1 && (
              <button className="govuk-button govuk-button--warning" onClick={() => removeTheme(i)}>
                Remove theme
              </button>
            )}
          </div>
        ))}

        <button className="govuk-button govuk-button--secondary" onClick={addTheme}>
          Add another theme
        </button>

        <div className="govuk-form-group" style={{marginTop: '20px'}}>
          <label className="govuk-label govuk-label--m" htmlFor="context">Context (optional)</label>
          <div className="govuk-hint">Tell the AI what this research is about, who the audience is, or any other relevant information.</div>
          <textarea
            className="govuk-textarea"
            id="context"
            rows="3"
            value={context}
            onChange={e => setContext(e.target.value)}
          />
        </div>

        <button className="govuk-button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating...' : 'Generate communication'}
        </button>

      </div>
    </div>
  )
}
