import Koa from 'koa';
import Router from 'koa-router';
import mainRouter from './server/routes/index';
import bodyParser from 'koa-bodyparser';
import { internalErrorHandler, notAvailablePathErrorHandler } from './server/middlewares/errorHandler'
import cors from '@koa/cors';

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());
app.use(cors());

const port = 3000;

app.use(mainRouter.routes())
app.use(internalErrorHandler)
app.use(notAvailablePathErrorHandler)

app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`);
});