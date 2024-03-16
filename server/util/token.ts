import jwt from 'jsonwebtoken';
import { Context } from 'koa';

export class Token {
    private readonly secretKey: string;

    constructor(secretKey: string) {
        this.secretKey = secretKey;
    }

    generateToken = async (username: string, userType: number) => {
        try {
            const payload = { username, userType };
            const existingToken = jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
            const decoded = jwt.decode(existingToken) as { exp?: number };

            if (decoded.exp !== undefined && decoded.exp * 1000 - Date.now() < 10 * 1000) {
                return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
            }
            return existingToken;
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('토큰 생성 실패');
        }
    }


    setJwtTokenInCookie = async (ctx: Context, username: string, userType: number) => {
        const userToken = await this.generateToken(username, userType);
        ctx.cookies.set('jwtToken', userToken, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });
    }
}

