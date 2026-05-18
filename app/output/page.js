'use client'

import { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'

const GOVUK_CHART_PALETTE = [
  '#1D70B8',
  '#0F385C',
  '#CA357C',
  '#7F65B7',
  '#50A1A5',
  '#F7996A',
]

export default function Output() {
  const [result, setResult] = useState(null)
  const [data, setData] = useState(null)
  const [type, setType] = useState(null)
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

    const chartData = type === 'mixed' ? data.quant : data
    const labels = chartData.labels
    const series = chartData.series
    const chartType = result.chart_type

    const allValues = series.flatMap(s => s.values.map(Number).filter(v => !isNaN(v)))
    const isDecimal = allValues.every(v => v >= 0 && v <= 1)

    const legendHeight = series.length > 1 ? 40 : 0
    const margin = { top: 20, right: 20, bottom: 50 + legendHeight, left: 70 }
    const totalWidth = el.offsetWidth
    const totalHeight = 360
    const width = totalWidth - margin.left - margin.right
    const height = totalHeight - margin.top - margin.bottom

    const svg = d3.select(el)
      .append('svg')
      .attr('width', totalWidth)
      .attr('height', totalHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const yMax = d3.max(allValues)
    const y = d3.scaleLinear()
      .domain([0, isDecimal ? 1 : yMax * 1.1])
      .range([height, 0])

    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d => isDecimal ? `${Math.round(d * 100)}%` : d)

    svg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '13px')
      .style('fill', '#0B0C0C')

    svg.selectAll('.domain').style('stroke', '#CECECE')
    svg.selectAll('.tick line').style('stroke', '#CECECE')

    svg.selectAll('.grid-line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .style('stroke', '#CECECE')
      .style('stroke-width', 1)

    if (chartType === 'line') {
      const x = d3.scalePoint().domain(labels).range([0, width]).padding(0.1)

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '13px')
        .style('fill', '#0B0C0C')

      series.forEach((s, i) => {
        const lineData = labels
          .map((l, li) => ({ label: l, value: Number(s.values[li]) }))
          .filter(d => !isNaN(d.value))

        svg.append('path')
          .datum(lineData)
          .attr('fill', 'none')
          .attr('stroke', GOVUK_CHART_PALETTE[i % GOVUK_CHART_PALETTE.length])
          .attr('stroke-width', 2.5)
          .attr('d', d3.line().x(d => x(d.label)).y(d => y(d.value)))

        svg.selectAll(`.dot-${i}`)
          .data(lineData)
          .enter()
          .append('circle')
          .attr('cx', d => x(d.label))
          .attr('cy', d => y(d.value))
          .attr('r', 5)
          .attr('fill', GOVUK_CHART_PALETTE[i % GOVUK_CHART_PALETTE.length])
      })

    } else {
      const x0 = d3.scaleBand().domain(labels).range([0, width]).padding(0.2)
      const x1 = d3.scaleBand()
        .domain(series.map(s => s.name))
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05)

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll('text')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '13px')
        .style('fill', '#0B0C0C')

      labels.forEach(label => {
        series.forEach((s, i) => {
          const val = Number(s.values[labels.indexOf(label)])
          if (isNaN(val)) return
          svg.append('rect')
            .attr('x', x0(label) + x1(s.name))
            .attr('y', y(val))
            .attr('width', x1.bandwidth())
            .attr('height', height - y(val))
            .attr('fill', GOVUK_CHART_PALETTE[i % GOVUK_CHART_PALETTE.length])
        })
      })
    }

    if (series.length > 1) {
      const maxPerRow = Math.floor(width / 140)
      const legend = svg.append('g').attr('transform', `translate(0,${height + 36})`)
      series.forEach((s, i) => {
        const col = i % maxPerRow
        const row = Math.floor(i / maxPerRow)
        legend.append('rect')
          .attr('x', col * 140)
          .attr('y', row * 22)
          .attr('width', 14)
          .attr('height', 14)
          .attr('fill', GOVUK_CHART_PALETTE[i % GOVUK_CHART_PALETTE.length])
        legend.append('text')
          .attr('x', col * 140 + 20)
          .attr('y', row * 22 + 12)
          .text(s.name)
          .style('font-size', '13px')
          .style('font-family', 'Arial, sans-serif')
          .style('fill', '#0B0C0C')
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
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: 'Summary', bold: true })] }),
          new Paragraph({ text: result.narrative }),
          new Paragraph({ text: '' }),
          ...(result.key_stat ? [
            new Paragraph({ children: [new TextRun({ text: 'Key stat: ', bold: true }), new TextRun(result.key_stat)] }),
            new Paragraph({ text: '' }),
          ] : []),
          ...(result.key_theme ? [
            new Paragraph({ children: [new TextRun({ text: 'Key theme: ', bold: true }), new TextRun(result.key_theme)] }),
            new Paragraph({ text: '' }),
          ] : []),
          ...(result.pull_quotes ? [
            new Paragraph({ children: [new TextRun({ text: 'Pull quotes', bold: true })] }),
            ...result.pull_quotes.map(q => new Paragraph({ text: `"${q}"` })),
            new Paragraph({ text: '' }),
          ] : []),
          new Paragraph({ children: [new TextRun({ text: 'Alt text: ', bold: true }), new TextRun(result.alt_text || '')] }),
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

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            <h1 className="govuk-heading-xl" style={{marginBottom: '30px'}}>Your communication</h1>

            {/* Headline card */}
            <div style={{borderLeft: '6px solid #1D70B8', padding: '20px 24px', background: '#ffffff', marginBottom: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)'}}>
              <strong style={{background: '#1D70B8', color: '#ffffff', fontSize: '12px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', padding: '4px 10px', letterSpacing: '0.05em', display: 'inline-block', marginBottom: '16px'}}>
                GOV.UK HEADLINE
              </strong>
              <h2 className="govuk-heading-l" style={{color: '#1D70B8', margin: '0'}}>
                {result.govuk_headline}
              </h2>
            </div>

            {/* Narrative */}
            <p className="govuk-body" style={{fontSize: '18px', lineHeight: '1.6', marginBottom: '32px'}}>
              {result.narrative}
            </p>

            {/* Key stat and theme */}
            {(result.key_stat || result.key_theme) && (
              <div style={{display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap'}}>
                {result.key_stat && (
                  <div style={{display: 'inline-flex', flexDirection: 'column', background: '#1D70B8', color: '#ffffff', padding: '20px 28px', minWidth: '180px', maxWidth: '300px'}}>
                    <p style={{margin: '0 0 8px 0', fontSize: '12px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', letterSpacing: '0.08em', opacity: 0.85}}>KEY STAT</p>
                    <p style={{margin: '0', fontSize: '22px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', lineHeight: '1.2'}}>{result.key_stat}</p>
                  </div>
                )}
                {result.key_theme && (
                  <div style={{display: 'inline-flex', flexDirection: 'column', background: '#158187', color: '#ffffff', padding: '20px 28px', minWidth: '180px', maxWidth: '300px'}}>
                    <p style={{margin: '0 0 8px 0', fontSize: '12px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', letterSpacing: '0.08em', opacity: 0.85}}>KEY THEME</p>
                    <p style={{margin: '0', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', lineHeight: '1.3'}}>{result.key_theme}</p>
                  </div>
                )}
              </div>
            )}

            {/* Chart */}
            {type !== 'qual' && (
              <div style={{marginBottom: '40px'}}>
                <div ref={chartRef} style={{width: '100%', background: '#ffffff', padding: '16px', border: '1px solid #CECECE'}} />
                <div style={{marginTop: '16px'}}>
                  <button className="govuk-button govuk-button--secondary" style={{marginBottom: 0}} onClick={copyChart}>
                    {copied ? '✓ Copied to clipboard' : 'Copy chart as image'}
                  </button>
                </div>
                {result.alt_text && (
                  <p className="govuk-body-s" style={{color: '#484949', marginTop: '12px', padding: '12px', background: '#F4F8FB', borderLeft: '4px solid #CECECE'}}>
                    <strong>Alt text:</strong> {result.alt_text}
                  </p>
                )}
              </div>
            )}

            {/* Pull quotes */}
            {result.pull_quotes && result.pull_quotes.length > 0 && (
              <div style={{marginBottom: '40px'}}>
                <h3 className="govuk-heading-s" style={{marginBottom: '20px'}}>Pull quotes</h3>
                {result.pull_quotes.map((q, i) => (
                  <blockquote key={i} style={{borderLeft: '4px solid #50A1A5', paddingLeft: '20px', margin: '0 0 20px 0'}}>
                    <p className="govuk-body" style={{fontStyle: 'italic', fontSize: '18px', margin: 0}}>"{q}"</p>
                  </blockquote>
                ))}
              </div>
            )}

            {/* Download */}
            <div style={{marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid #CECECE'}}>
              <button className="govuk-button" onClick={downloadWord} style={{marginBottom: 0, backgroundColor: '#1D70B8'}}>
                Download as Word doc
              </button>
            </div>

            {/* Tabloid */}
            <details className="govuk-details" style={{marginBottom: '40px'}}>
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text" style={{color: '#CA357C'}}>
                  🗞 Tabloid headline — do not use
                </span>
              </summary>
              <div className="govuk-details__text" style={{background: '#FCF5F8', borderLeft: '4px solid #CA357C', padding: '16px 20px'}}>
                <p style={{margin: '0 0 8px 0', fontSize: '12px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#CA357C', letterSpacing: '0.05em'}}>FOR ENTERTAINMENT PURPOSES ONLY</p>
                <p className="govuk-heading-m" style={{color: '#CA357C', margin: 0}}>{result.tabloid_headline}</p>
              </div>
            </details>

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <div style={{background: '#F4F8FB', padding: '20px', position: 'sticky', top: '20px', border: '1px solid #8EB8DC'}}>
              <h3 className="govuk-heading-s" style={{marginBottom: '16px'}}>About this output</h3>
              {result.chart_type && (
                <div style={{marginBottom: '12px'}}>
                  <p className="govuk-body-s" style={{margin: '0 0 2px 0', fontWeight: 'bold'}}>Chart type</p>
                  <p className="govuk-body-s" style={{margin: 0, textTransform: 'capitalize'}}>{result.chart_type}</p>
                </div>
              )}
              {result.chart_rationale && (
                <div style={{marginBottom: '12px'}}>
                  <p className="govuk-body-s" style={{margin: '0 0 2px 0', fontWeight: 'bold'}}>Why this chart</p>
                  <p className="govuk-body-s" style={{margin: 0}}>{result.chart_rationale}</p>
                </div>
              )}
              {result.trend && (
                <div style={{marginBottom: '12px'}}>
                  <p className="govuk-body-s" style={{margin: '0 0 2px 0', fontWeight: 'bold'}}>Trend</p>
                  <p className="govuk-body-s" style={{margin: 0, textTransform: 'capitalize'}}>{result.trend}</p>
                </div>
              )}
              <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
              <p className="govuk-body-s" style={{color: '#484949', margin: 0}}>Always review AI-generated content before sharing or publishing.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}