import { Context } from "koa";
import { LoginRequest, UserCard } from "../interfaces/IUser";
import qs from 'qs'
import axios from 'axios'
import UserService from "../services/userService";
import { Token } from "../util/token";
import { Database } from "../database/config";
import { Calculator } from "../util/calculator";

export default class Users {
    private readonly userService: UserService;
    private readonly tokenService: Token;
    private readonly calculator: Calculator
    private db: Database;

    constructor() {
        this.userService = new UserService();
        this.tokenService = new Token('secretKey');
        this.db = Database.getInstance();
        this.calculator = new Calculator();
    }

    // 회원가입
    registerUser = async (ctx: Context) => {
        const client = await this.db.connect();
        const registReq = ctx.request.body as LoginRequest;
        try {
            await client.query('BEGIN');
            const result = await this.userService.registerUser(client, registReq);
            if (result) {
                const username = result[0].username
                const userType = result[0].user_type
                await this.tokenService.setJwtTokenInCookie(ctx, username, userType);
                await client.query('COMMIT');
                ctx.body = { username };
            } else {
                ctx.body = { success: false, message: `${registReq.username} 이미 있음` };
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error during register:", error);
            ctx.body = { success: false, message: '유저 등록 실패' };
        } finally {
            client.release();
        }
    }

    // 로그인
    loginUser = async (ctx: Context) => {
        const loginReq = ctx.request.body as LoginRequest;
        try {
            const result = await this.userService.loginUser(loginReq);
            if (result) {
                const username = result[0].username
                const userType = result[0].user_type
                await this.tokenService.setJwtTokenInCookie(ctx, username, userType);
                ctx.body = { success: true, message: username };
            } else {
                ctx.body = { success: false, message: `${loginReq.username} 로그인 실패` };
            }
        } catch (error) {
            console.error("Error during login:", error);
            ctx.body = { success: false, message: '로그인 실패' };
        }
    }

    // 로그아웃
    logoutUser = async (ctx: Context) => {
        try {
            ctx.cookies.set('jwtToken', null, { httpOnly: true, expires: new Date(0) });
            ctx.body = { success: true, message: '로그아웃 성공' };
        } catch (error) {
            console.error('Error during logout:', error);
            ctx.body = { success: false, message: '로그아웃 실패' };
        }
    }

    kakaoLogin = async (ctx: Context) => {
        const kakaoData = {
            client_id: process.env.REST_API_KEY,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: 'http://localhost:3000/user/oauth/kakao/callback',
        };

        const kakaoAuthorize = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoData.client_id}&redirect_uri=${kakaoData.redirect_uri}&response_type=code`;
        ctx.redirect(kakaoAuthorize);
    }

    loginWithKakao = async (ctx: Context) => {
        const { code } = ctx.request.query as any
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const formData = {
                grant_type: 'authorization_code',
                client_id: process.env.REST_API_KEY,
                redirect_uri: 'http://localhost:3000/user/oauth/kakao/callback',
                code,
                client_secret: process.env.CLIENT_SECRET,
            };

            const {
                data: { access_token },
            } = await axios.post(`https://kauth.kakao.com/oauth/token?${qs.stringify(formData)}`);

            const { data: userInfo } = await axios.get('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: 'Bearer ' + access_token,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                },
            });

            const username = userInfo.properties.nickname;
            const profileImg = userInfo.properties.profile_image;
            const id = userInfo.id

            const user = await this.userService.getUserByUserKakaoId(id);
            let createAccountResult;
            if (user === null) {
                const { ok: user } = await this.userService.createKakaoAccount(client, {
                    username,
                    id,
                    profileImg
                });
                createAccountResult = { ok: user };
                await client.query('COMMIT');
            }

            if (user || createAccountResult) {
                const loginResult = await this.userService.kakaoLogin(id);
                if (loginResult) {
                    await this.tokenService.setJwtTokenInCookie(ctx, username, loginResult.user_type);
                    ctx.body = { success: true, token: '토큰 생성 성공' };
                } else {
                    ctx.body = { success: false, message: '카카오 로그인 실패' };
                }
            } else {
                ctx.body = { success: false, message: "카카오 유저 등록 실패" };
            }
        } catch (e) {
            await client.query('ROLLBACK');
            console.error(e);
            ctx.body = { success: false, error: '카카오 로그인 실패' };
        } finally {
            client.release();
        }
    }

    // 현재 보유 카드 등록
    createUserCard = async (ctx: Context) => {
        const client = await this.db.connect();
        const userCard = ctx.request.body as UserCard
        try {
            await client.query('BEGIN');
            const registerCard = await this.userService.userCard(client, userCard);
            const userIndustry = {
                user_card_id: registerCard.user_card_id,
                industry: userCard.industry,
                amount: userCard.amount

            }
            const createUserIndustry = await this.userService.userIndustry(client, userIndustry)
            await client.query('COMMIT');
            ctx.body = { success: true, result: createUserIndustry };
        } catch (error) {
            console.error('Error during create post:', error);
            await client.query('ROLLBACK');
            ctx.body = { success: false, message: '카드 등록 실패' };
        } finally {
            client.release();
        }
    }

    // 현재 보유 카드 리스트
    userCardList = async (ctx: Context) => {
        const user_id = ctx.request.body as { user_id: number }
        try {
            const result = await this.userService.getUserCardList(user_id)
            ctx.body = { success: true, result: result };
        } catch (error) {
            console.error('Error during ')
        }
    }

    // 현재 보유 카드 삭제
    deleteUserCard = async (ctx: Context) => {
        const { userCardId } = ctx.params;
        const userId = ctx.request.body as any;
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const deletedUserCard = await this.userService.deletePost(client, userId, userCardId);
            if (!deletedUserCard) {
                await client.query('COMMIT');
                ctx.body = { success: true, result: deletedUserCard };
            } else {
                ctx.body = { success: false, result: deletedUserCard };
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error during delete user card:', error);
            ctx.body = { success: false, message: 'USER CARD 삭제 실패' };
        } finally {
            client.release();
        }
    }

    // 현재 보유 카드 상세보기
    userCardWithPicking = async (ctx: Context) => {
        try {
            const userCardId = ctx.params as { id: number }
            const industryRate = await this.userService.getUserCard(userCardId.id)

            if (!industryRate) {
                throw new Error('userCardId 조회 실패');
            }
            const industryAmount = await this.userService.getUserIndustry(industryRate[0].user_card_id)
            if (!industryAmount) {
                throw new Error('userCardId 조회 실패');
            }
            const benefits = await this.calculator.totalBenenfit(industryRate, industryAmount)
            if (!benefits) {
                throw new Error('benefits 조회 실패')
            }
            const pickingResult = await this.calculator.picking(benefits, industryRate[0].pay_per_month)
            if (!pickingResult) {
                throw new Error('picking 조회 실패')
            }
            const result = pickingResult.map((item: any) => ({
                prod_card_id: item.prod_card_id,
                card_type: item.card_type,
                card_name: item.card_name,
                benefit_type: item.benefit_type,
                bin: item.bin,
                company: item.company,
                annual_fee: item.annual_fee,
                previous_month: item.previous_month,
                apply_url: item.apply_url,
                card_benefit_id: item.card_benefit_id,
                total_benefit: item.total_benefit,
                picking: `${item.picking}%`,
                industrys: item.industrys.map((industryItem: any) => ({
                    industry: industryItem.industry,
                    rate: industryItem.rate,
                    benefit: industryItem.benefit,
                })),
            }));

            ctx.body = { success: true, result };
        } catch (error) {
            console.error('Error during get profits list:', error);
            ctx.body = { success: false, message: 'profitsList 실패' };
        }

    }

    // 보유카드, 추천카드 비교
    cardComparsion = async (ctx: Context) => {
        const { userCardId } = ctx.params;
        const userId = ctx.request.body as any;
        const client = await this.db.connect();
        try {

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error during delete post:', error);
            ctx.body = { success: false, message: 'POST 삭제 실패' };
        } finally {
            client.release();
        }
    }
}
