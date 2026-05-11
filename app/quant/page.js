'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export default function Quant() {
  const router = useRouter()
  const [inputMethod, setInputMethod] = useState('manual')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [manualData, setManualData] = useState({
    labels: [''],
    series: [{ name: 'Value', values: [''] }]
  })

  function addRow() {
    setManualData(d => ({
      ...d,
      labels: [...d.labels, ''],
      series: d.series.map(s => ({ ...s, values: [...s.values, ''] }))
    }))
  }

  function addSeries() {
    setManualData(d => ({
      ...d,
      series: [...d.series, { name: 'Series ' + (d.series.length + 1), values: d.labels.map(() => '') }]
    }))
  }

  function updateLabel(i, val) {
    setManualData(d => {
      const labels = [...d.labels]
      labels[i] = val
      return { ...d, labels }
    })
  }

  function updateSeriesName(si, val) {
    setManualData(d => {
      const series = [...d.series]
      series[si] = { ...series[si], name: val }
      return { ...d, series }
    })
  }

  function updateValue(si, vi, val) {
    setManualData(d => {
      const series = [...d.series]
      const values = [...series[si].values]
      values[vi] = val
      series[si] = { ...series[si], values }
      return { ...d, series }
    })
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => processTableData(results.data),
        header: false
      })
    } else {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
        processTableData(data)
      }
      reader.readAsBinaryString(file)
    }
  }

  function processTableData(rows) {
    if (!rows || rows.length < 2) return
    const headers = rows[0].slice(1)
    const labels = rows.slice(1).map(r => String(r[0] || ''))
    const series = headers.map((name, hi) => ({
      name: String(name || ''),
      values: rows.slice(1).map(r => String(r[hi + 1] || ''))
    }))
    setManualData({ labels, series })
    setInputMethod('manual')
  }

  async function handleSubmit() {
    setLoading(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quant', data: manualData, context })
    })
    const json = await res.json()
    if (json.success) {
      sessionStorage.setItem('datapal_result', JSON.stringify(json.result))
      sessionStorage.setItem('datapal_data', JSON.stringify(manualData))
      sessionStorage.setItem('datapal_type', 'quant')
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
        <h1 className="govuk-heading-xl">Quant data</h1>

        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">How do you want to enter your data?</legend>
            <div className="govuk-radios govuk-radios--inline">
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="manual" name="method" type="radio" value="manual" checked={inputMethod === 'manual'} onChange={() => setInputMethod('manual')} />
                <label className="govuk-label govuk-radios__label" htmlFor="manual">Enter manually</label>
              </div>
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="upload" name="method" type="radio" value="upload" checked={inputMethod === 'upload'} onChange={() => setInputMethod('upload')} />
                <label className="govuk-label govuk-radios__label" htmlFor="upload">Upload CSV or Excel</label>
              </div>
            </div>
          </fieldset>
        </div>

        {inputMethod === 'upload' && (
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m" htmlFor="file">Upload your file</label>
            <div className="govuk-hint">Accepts .csv or .xlsx files. First column should be labels, first row should be series names.</div>
            <input className="govuk-file-upload" id="file" name="file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} />
          </div>
        )}

        {inputMethod === 'manual' && (
          <div style={{overflowX: 'auto', marginBottom: '20px'}}>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header">Label</th>
                  {manualData.series.map((s, si) => (
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
                {manualData.labels.map((label, i) => (
                  <tr key={i} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <input
                        className="govuk-input govuk-input--width-10"
                        value={label}
                        onChange={e => updateLabel(i, e.target.value)}
                        placeholder="e.g. Q1 2024"
                      />
                    </td>
                    {manualData.series.map((s, si) => (
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
            <button className="govuk-button govuk-button--secondary" onClick={addSeries} style={{marginLeft: '10px'}}>Add series</button>
          </div>
        )}

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="context">Context (optional)</label>
          <div className="govuk-hint">Tell the AI what this data is about, who the audience is, or any other relevant information.</div>
          <textarea className="govuk-textarea" id="context" name="context" rows="3" value={context} onChange={e => setContext(e.target.value)} />
        </div>

        <button className="govuk-button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating...' : 'Generate communication'}
        </button>

      </div>
    </div>
  )
}
