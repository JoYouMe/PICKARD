import Koa from 'koa';
import Router from 'koa-router';
import testRouter from './test'
import userRouter from './userRouter'
import cardRouter from './cardRouter'
import adminRouter from './adminRouter'

const app = new Koa();
const router = new Router();

router.use('/test', testRouter.routes());
router.use('/user', userRouter.routes());
router.use('/card', cardRouter.routes());
router.use('/admin', adminRouter.routes());
app.use(router.routes()).use(router.allowedMethods());

export default router;