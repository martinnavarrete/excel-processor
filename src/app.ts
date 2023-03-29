import express, { Express } from 'express';
import { connect } from './db/connect';
import isAuth from './middleware/auth';
import { routes } from './router';

// TODO: Add an env file to store the port
const port = 3000;

const app: Express = express();

app.listen(port, async () => {
  await connect();

  console.log(`Express app running on port ${port}!`);

  app.use(isAuth);

  routes(app);
});
