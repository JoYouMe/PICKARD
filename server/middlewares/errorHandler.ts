import { Context, Next } from 'koa';

export const notAvailablePathErrorHandler = async (ctx: Context, next: Next) => {
    ctx.status = 404;
    ctx.body = { message: 'You have accessed the wrong path' };
};

export const internalErrorHandler = async (ctx: Context, next: Next) => {
    try {
        await next();
    } catch (err) {
        console.trace(err);
        ctx.status = 500;
        ctx.body = { message: 'Internal server error' };
    }
};
