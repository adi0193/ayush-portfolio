import { createApp } from './app.js';
import { config } from './lib/config.js';

const app = createApp();
app.listen(config.port, () => {
  console.log(`Bihar Farmer Assistant API listening on :${config.port}`);
});
