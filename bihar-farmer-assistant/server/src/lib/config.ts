export const config = {
  port: Number(process.env.PORT ?? 8080),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  dataGovApiKey: process.env.DATA_GOV_IN_API_KEY ?? '',
  mandiResourceId: process.env.MANDI_RESOURCE_ID ?? '9ef84268-d588-465a-a308-a864a43d0070',
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  llmModel: process.env.LLM_MODEL ?? 'claude-opus-5-5',
  adminToken: process.env.ADMIN_TOKEN ?? '',
  /** Open-Meteo is used because it needs no key; IMD's API requires IP whitelisting. */
  openMeteoBase: process.env.OPEN_METEO_BASE ?? 'https://api.open-meteo.com/v1/forecast',
};
