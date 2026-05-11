'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Mixed() {
  const router = useRouter()
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [quant, setQuant] = useState({
    labels: [''],
    series: [{ name: 'Value', values: [''] }]
  })
  const [themes, setThemes] = useState([{ theme: '', description: '', frequency: '' }])

  function addRow() {
    setQuant(d => ({
      ...d,
      labels: [...d.labels, ''],
      series: d.series.map(s => ({ ...s, values: [...s.values, ''] }))
    }))
  }

  function updateLabel(i, val) {
    setQuant(d => {
      const labels = [...d.labels]
      labels[i] = val
      return { ...d, labels }
    })
  }

  function updateValue(si, vi, val) {
    setQuant(d => {
      const series = [...d.series]
      const values = [...series[si].values]
      values[vi] = val
      series[si] = { ...series[si], values }
      return { ...d, series }
    })
  }

  function updateSeriesName(si, val) {
    setQuant(d => {
      const series = [...d.series]
      series[si] = { ...series[si], name: val }
      return { ...d, series }
    })
  }

  function addTheme() {
    setThemes(t => [...t, { theme: '', description: '', frequency: '' }])
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
      body: JSON.stringify({ type: 'mixed', data: { quant, qual: themes }, context })
    })
    const json = await res.json()
    if (json.success) {
      sessionStorage.setItem('datapal_result', JSON.stringify(json.result))
      sessionStorage.setItem('datapal_data', JSON.stringify({ quant, qual: themes }))
      sessionStorage.setItem('datapal_type', 'mixed')
      router.push('/output')
    } else {
      alert('Error: ' + json.error)
      setLoading(false)
    }
  }

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <a href="/" className="govuk-back-link">Back</a>
        <h1 className="govuk-heading-xl">Mixed data</h1>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <h2 className="govuk-heading-m">Quant data</h2>

            <div style={{overflowX: 'auto', marginBottom: '20px'}}>
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th className="govuk-table__header">Label</th>
                    {quant.series.map((s, si) => (
                      <th key={si} className="govuk-table__header">
                        <input
                          className="govuk-input govuk-input--width-10"
                          value={s.name}
                          onChange={e => updateSeriesName(si, e.target.value)}
                          placeholder="Series name"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {quant.labels.map((label, i) => (
                    <tr key={i} className="govuk-table__row">
                      <td className="govuk-table__cell">
                        <input
                          className="govuk-input govuk-input--width-10"
                          value={label}
                          onChange={e => updateLabel(i, e.target.value)}
                          placeholder="e.g. Q1 2024"
                        />
                      </td>
                      {quant.series.map((s, si) => (
                        <td key={si} className="govuk-table__cell">
                          <input
                            className="govuk-input govuk-input--width-5"
                            value={s.values[i]}
                            onChange={e => updateValue(si, i, e.target.value)}
                            placeholder="0"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="govuk-button govuk-button--secondary" onClick={addRow}>Add row</button>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <h2 className="govuk-heading-m">Qual themes</h2>

            {themes.map((t, i) => (
              <div key={i} style={{background: '#f3f2f1', padding: '16px', marginBottom: '12px'}}>
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor={`theme-${i}`}>Theme {i + 1}</label>
                  <input
                    className="govuk-input"
                    id={`theme-${i}`}
                    value={t.theme}
                    onChange={e => updateTheme(i, 'theme', e.target.value)}
                    placeholder="e.g. Lack of trust"
                  />
                </div>
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor={`desc-${i}`}>Description</label>
                  <textarea
                    className="govuk-textarea"
                    id={`desc-${i}`}
                    rows="2"
                    value={t.description}
                    onChange={e => updateTheme(i, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button className="govuk-button govuk-button--secondary" onClick={addTheme}>
              Add theme
            </button>
          </div>
        </div>

        <div className="govuk-form-group" style={{marginTop: '20px'}}>
          <label className="govuk-label govuk-label--m" htmlFor="context">Context (optional)</label>
          <div className="govuk-hint">What is this research about? Who is the audience?</div>
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
