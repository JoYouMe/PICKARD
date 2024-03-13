import jwt, { JwtPayload } from 'jsonwebtoken';
import { Context, Next } from 'koa';
import { Token } from '../util/token';

export class AuthenticationMiddleware {
    private readonly tokenManager: Token;

    constructor(secretKey: string) {
        this.tokenManager = new Token(secretKey);
    }

    authenticate = async (ctx: Context, next: Next) => {
        const cookieToken = ctx.cookies.get('jwtToken');
        try {
            if (cookieToken) {
                const decodedToken = jwt.verify(cookieToken, 'secretKey') as JwtPayload;
                const userType = decodedToken.userType;
                if (userType === '0') {
                    await this.tokenManager.setJwtTokenInCookie(ctx, decodedToken.username, userType);
                    ctx.state.user = decodedToken;
                    return next();
                } else {
                    ctx.status = 403;
                    ctx.body = { error: '권한 없음' };
                }
            } else {
                ctx.status = 401;
                ctx.body = { error: 'Unauthorized' };
            }
        } catch (error) {
            console.error('JWT verification error:', error);
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized' };
        }
    }
}
