import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request) {
  const body = await request.json()
  const { type, data, context } = body

  let systemPrompt = `You are a GOV.UK data communication specialist. You help analysts turn findings into clear, engaging communications.

GOV.UK writing rules:
- Use active verbs and front-load the most important information
- Use plain English — avoid jargon
- Headlines must be concise (under 12 words), specific, and lead with the key finding
- State key numbers prominently

You must respond ONLY with valid JSON, no markdown, no preamble.`

  let userPrompt = ''

  if (type === 'quant') {
    userPrompt = `Analyse this quantitative data and produce a communication pack.

Data: ${JSON.stringify(data)}
Context: ${context || 'None provided'}

Respond with this exact JSON structure:
{
  "govuk_headline": "Plain English GOV.UK headline under 12 words",
  "tabloid_headline": "Punchy tabloid-style headline, fun and dramatic",
  "narrative": "2-3 sentence GOV.UK plain English summary of the finding",
  "chart_type": "line|bar|grouped-bar|stacked-bar|table",
  "chart_rationale": "One sentence explaining the chart choice",
  "alt_text": "Full accessibility description of the chart in 2-3 sentences",
  "key_stat": "The single most important number or finding",
  "trend": "increase|decrease|stable|comparison|mixed"
}`
  }

  if (type === 'qual') {
    userPrompt = `Analyse these qualitative themes and produce a communication pack.

Themes: ${JSON.stringify(data)}
Context: ${context || 'None provided'}

Respond with this exact JSON structure:
{
  "govuk_headline": "Plain English GOV.UK headline under 12 words",
  "tabloid_headline": "Punchy tabloid-style headline, fun and dramatic",
  "narrative": "2-3 sentence GOV.UK plain English summary of the themes",
  "pull_quotes": ["Quote or theme 1", "Quote or theme 2", "Quote or theme 3"],
  "key_theme": "The single most prominent theme in plain English",
  "theme_summary": "One sentence per theme as a bullet-ready string array",
  "alt_text": "Description of the qualitative findings for accessibility"
}`
  }

  if (type === 'mixed') {
    userPrompt = `Analyse this mixed qualitative and quantitative data and produce a communication pack.

Quant data: ${JSON.stringify(data.quant)}
Qual themes: ${JSON.stringify(data.qual)}
Context: ${context || 'None provided'}

Respond with this exact JSON structure:
{
  "govuk_headline": "Plain English GOV.UK headline under 12 words",
  "tabloid_headline": "Punchy tabloid-style headline, fun and dramatic",
  "narrative": "3-4 sentence GOV.UK plain English summary weaving together the quant and qual findings",
  "chart_type": "line|bar|grouped-bar|stacked-bar|table",
  "chart_rationale": "One sentence explaining the chart choice",
  "pull_quotes": ["Quote or theme 1", "Quote or theme 2"],
  "key_stat": "The single most important number",
  "key_theme": "The single most prominent theme",
  "alt_text": "Full accessibility description of the combined findings",
  "trend": "increase|decrease|stable|comparison|mixed"
}`
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })

    let text = response.content[0].text.trim()
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    const result = JSON.parse(text)

    return Response.json({ success: true, result })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
