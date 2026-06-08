import app from './app.js';
import { connectDB } from './config/db.js';
import { assertProductionEnv, env } from './config/env.js';

const start = async () => {
  assertProductionEnv();
  await connectDB();

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
