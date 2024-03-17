import Router from 'koa-router';

const router = new Router();

router.get('/:id', (ctx) => {
    const { id } = ctx.params;
    const test = ctx.request.body as number

    ctx.body = { id, test }
});

export default router;
