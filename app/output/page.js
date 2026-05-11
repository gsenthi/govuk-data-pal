'use client'

import { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'

const GOVUK_PALETTE = ['#12436D', '#28A197', '#801650', '#F46A25', '#3D3D3D', '#A285D1', '#247453', '#7DAD2A']

export default function Output() {
  const [result, setResult] = useState(null)
  const [data, setData] = useState(null)
  const [type, setType] = useState(null)
  const [showTabloid, setShowTabloid] = useState(false)
  const [copied, setCopied] = useState(false)
  const chartRef = useRef(null)

  useEffect(() => {
    const r = sessionStorage.getItem('datapal_result')
    const d = sessionStorage.getItem('datapal_data')
    const t = sessionStorage.getItem('datapal_type')
    if (r) setResult(JSON.parse(r))
    if (d) setData(JSON.parse(d))
    if (t) setType(t)
  }, [])

  useEffect(() => {
    if (result && data && type !== 'qual' && chartRef.current) {
      drawChart()
    }
  }, [result, data, type])

  function drawChart() {
    const el = chartRef.current
    if (!el) return
    d3.select(el).selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 60, left: 60 }
    const width = el.offsetWidth - margin.left - margin.right
    const height = 320 - margin.top - margin.bottom

    const svg = d3.select(el)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const chartData = type === 'mixed' ? data.quant : data
    const labels = chartData.labels
    const series = chartData.series
    const chartType = result.chart_type

    if (chartType === 'line') {
      const x = d3.scalePoint().domain(labels).range([0, width])
      const allValues = series.flatMap(s => s.values.map(Number).filter(v => !isNaN(v)))
      const y = d3.scaleLinear().domain([0, d3.max(allValues) * 1.1]).range([height, 0])

      svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
        .selectAll('text').style('font-family', 'Arial, sans-serif').style('font-size', '12px')
      svg.append('g').call(d3.axisLeft(y))
        .selectAll('text').style('font-family', 'Arial, sans-serif').style('font-size', '12px')

      series.forEach((s, i) => {
        const lineData = labels.map((l, li) => ({ label: l, value: Number(s.values[li]) })).filter(d => !isNaN(d.value))
        svg.append('path')
          .datum(lineData)
          .attr('fill', 'none')
          .attr('stroke', GOVUK_PALETTE[i % GOVUK_PALETTE.length])
          .attr('stroke-width', 2.5)
          .attr('d', d3.line().x(d => x(d.label)).y(d => y(d.value)))
        svg.selectAll(`.dot-${i}`)
          .data(lineData)
          .enter().append('circle')
          .attr('cx', d => x(d.label))
          .attr('cy', d => y(d.value))
          .attr('r', 5)
          .attr('fill', GOVUK_PALETTE[i % GOVUK_PALETTE.length])
      })
    } else {
      const x0 = d3.scaleBand().domain(labels).range([0, width]).padding(0.2)
      const x1 = d3.scaleBand().domain(series.map(s => s.name)).rangeRound([0, x0.bandwidth()]).padding(0.05)
      const allValues = series.flatMap(s => s.values.map(Number).filter(v => !isNaN(v)))
      const y = d3.scaleLinear().domain([0, d3.max(allValues) * 1.1]).range([height, 0])

      svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x0))
        .selectAll('text').style('font-family', 'Arial, sans-serif').style('font-size', '12px')
      svg.append('g').call(d3.axisLeft(y))
        .selectAll('text').style('font-family', 'Arial, sans-serif').style('font-size', '12px')

      labels.forEach(label => {
        series.forEach((s, i) => {
          const val = Number(s.values[labels.indexOf(label)])
          if (isNaN(val)) return
          svg.append('rect')
            .attr('x', x0(label) + x1(s.name))
            .attr('y', y(val))
            .attr('width', x1.bandwidth())
            .attr('height', height - y(val))
            .attr('fill', GOVUK_PALETTE[i % GOVUK_PALETTE.length])
        })
      })
    }

    if (series.length > 1) {
      const legend = svg.append('g').attr('transform', `translate(0,${height + 40})`)
      series.forEach((s, i) => {
        legend.append('rect').attr('x', i * 120).attr('width', 14).attr('height', 14).attr('fill', GOVUK_PALETTE[i % GOVUK_PALETTE.length])
        legend.append('text').attr('x', i * 120 + 18).attr('y', 12).text(s.name).style('font-size', '12px').style('font-family', 'Arial, sans-serif')
      })
    }
  }

  function copyChart() {
    const svg = chartRef.current?.querySelector('svg')
    if (!svg) return
    const canvas = document.createElement('canvas')
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  async function downloadWord() {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: result.govuk_headline, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ children: [new TextRun({ text: 'Summary', bold: true })] }),
          new Paragraph({ text: result.narrative }),
          ...(result.key_stat ? [
            new Paragraph({ children: [new TextRun({ text: 'Key stat: ', bold: true }), new TextRun(result.key_stat)] })
          ] : []),
          ...(result.key_theme ? [
            new Paragraph({ children: [new TextRun({ text: 'Key theme: ', bold: true }), new TextRun(result.key_theme)] })
          ] : []),
          ...(result.pull_quotes ? [
            new Paragraph({ children: [new TextRun({ text: 'Pull quotes', bold: true })] }),
            ...result.pull_quotes.map(q => new Paragraph({ text: `"${q}"` }))
          ] : []),
          new Paragraph({ children: [new TextRun({ text: 'Alt text: ', bold: true }), new TextRun(result.alt_text || '') ] }),
        ]
      }]
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data-pal-output.docx'
    a.click()
  }

  if (!result) return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <p className="govuk-body">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <a href="/" className="govuk-back-link">Start again</a>
        <h1 className="govuk-heading-xl">Your communication</h1>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            <div style={{borderLeft: '6px solid #12436D', padding: '16px 20px', background: '#fff', marginBottom: '24px', boxShadow: '2px 2px 0 #b1b4b6'}}>
              <strong className="govuk-tag" style={{background: '#12436D', marginBottom: '12px', display: 'inline-block'}}>
                GOV.UK HEADLINE
              </strong>
              <h2 className="govuk-heading-l" style={{color: '#12436D', marginTop: '12px', marginBottom: '0'}}>
                {result.govuk_headline}
              </h2>
            </div>

            <p className="govuk-body">{result.narrative}</p>

            {result.key_stat && (
              <div style={{background: '#12436D', color: '#fff', padding: '20px', marginBottom: '24px', display: 'inline-block', minWidth: '200px'}}>
                <p style={{margin: 0, fontSize: '13px', fontFamily: 'Arial'}}>KEY STAT</p>
                <p style={{margin: 0, fontSize: '28px', fontWeight: 'bold', fontFamily: 'Arial'}}>{result.key_stat}</p>
              </div>
            )}

            {result.key_theme && (
              <div style={{background: '#28A197', color: '#fff', padding: '20px', marginBottom: '24px', display: 'inline-block', minWidth: '200px', marginLeft: result.key_stat ? '16px' : '0'}}>
                <p style={{margin: 0, fontSize: '13px', fontFamily: 'Arial'}}>KEY THEME</p>
                <p style={{margin: 0, fontSize: '20px', fontWeight: 'bold', fontFamily: 'Arial'}}>{result.key_theme}</p>
              </div>
            )}

            {type !== 'qual' && (
              <div style={{marginBottom: '24px'}}>
                <div ref={chartRef} style={{width: '100%', background: '#fff', padding: '16px'}} />
                <div style={{marginTop: '8px'}}>
                  <button className="govuk-button govuk-button--secondary" onClick={copyChart}>
                    {copied ? '✓ Copied!' : 'Copy chart as image'}
                  </button>
                  <p className="govuk-body-s" style={{color: '#505A5F', marginTop: '8px'}}>{result.alt_text}</p>
                </div>
              </div>
            )}

            {result.pull_quotes && result.pull_quotes.length > 0 && (
              <div style={{marginBottom: '24px'}}>
                <h3 className="govuk-heading-s">Pull quotes</h3>
                {result.pull_quotes.map((q, i) => (
                  <blockquote key={i} style={{borderLeft: '4px solid #28A197', paddingLeft: '16px', margin: '0 0 16px 0'}}>
                    <p className="govuk-body" style={{fontStyle: 'italic'}}>"{q}"</p>
                  </blockquote>
                ))}
              </div>
            )}

            <div style={{marginBottom: '24px'}}>
              <button className="govuk-button" onClick={downloadWord}>Download as Word doc</button>
            </div>

            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text" style={{color: '#801650'}}>🗞 Tabloid headline — do not use</span>
              </summary>
              <div className="govuk-details__text" style={{background: '#fff1f4', borderLeft: '4px solid #801650'}}>
                <p className="govuk-body-s" style={{color: '#801650', fontWeight: 'bold', marginBottom: '4px'}}>FOR ENTERTAINMENT PURPOSES ONLY</p>
                <p className="govuk-heading-m" style={{color: '#801650'}}>{result.tabloid_headline}</p>
              </div>
            </details>

          </div>

          <div className="govuk-grid-column-one-third">
            <div style={{background: '#f3f2f1', padding: '20px'}}>
              <h3 className="govuk-heading-s">About this output</h3>
              {result.chart_type && <p className="govuk-body-s"><strong>Chart type:</strong> {result.chart_type}</p>}
              {result.chart_rationale && <p className="govuk-body-s"><strong>Why:</strong> {result.chart_rationale}</p>}
              {result.trend && <p className="govuk-body-s"><strong>Trend:</strong> {result.trend}</p>}
              <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
              <p className="govuk-body-s" style={{color: '#505A5F'}}>Always review AI-generated content before sharing.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
