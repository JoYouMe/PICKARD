import Koa from 'koa';
import Router from 'koa-router';
import Admin from '../controllers/admin';
import { AuthenticationMiddleware } from '../middlewares/authenticate';

// ADMIN이 관리하는 카드 상품

const app = new Koa();
const router = new Router();
const admin = new Admin();
const authenticate = new AuthenticationMiddleware('secretKey')

// 카드 상품 등록
router.post('/create', authenticate.authenticate, admin.createProdCard);
// router.post('/create', admin.createProdCard);
// 카드 상품 수정
router.post('/update/:id', admin.updateProdCard);
// 카드 상품 삭제
router.post('/delete/:id', admin.deleteProdCard);

app.use(router.routes()).use(router.allowedMethods());

export default router;