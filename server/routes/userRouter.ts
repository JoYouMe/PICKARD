import Koa from 'koa';
import Router from 'koa-router';
import Users from '../controllers/users';
import { AuthenticationMiddleware } from '../middlewares/authenticate';

const app = new Koa();
const router = new Router();
const user = new Users();
const authenticate = new AuthenticationMiddleware('secretKey')

router.post('/login', user.loginUser);
router.post('/register', user.registerUser);
router.post('/logout', user.logoutUser);
router.get('/oauth/kakao', user.kakaoLogin);
router.get('/oauth/kakao/callback', user.loginWithKakao);
// 현재 보유 카드 등록
// router.post('/userCard', authenticate.authenticate, user.createUserCard);
router.post('/userCard', user.createUserCard);
// 현재 보유 카드 리스트
router.get('/userCardList', user.userCardList)
// 현재 보유 카드 삭제
router.post('/delete/:id', user.deleteUserCard);
// 카드 비교
router.post('/comparison', user.cardComparsion)
// 카드 피킹률
router.get('/cardPicking/:id', user.userCardWithPicking)

app.use(router.routes()).use(router.allowedMethods());

export default router;