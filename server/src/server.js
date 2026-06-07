import app from './app.js';
import { connectDB } from './config/db.js';
import { assertProductionEnv, env } from './config/env.js';

const start = async () => {
  assertProductionEnv();
  await connectDB();

  app.listen(env.port, () => {
    console.log(`LearnHub AI LMS API running on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
