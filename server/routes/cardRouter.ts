import Koa from 'koa';
import Router from 'koa-router';
import Card from '../controllers/card';

const app = new Koa();
const router = new Router();
const card = new Card();

// 소비 패턴 질문
router.post('/questions', card.questions);
// 소비 패턴 조회
router.post('/getQuestions', card.getQuestions);
// 소비 패턴 결과 추천 카드
router.post('/profits', card.profitsList);
// 추천 카드 상세 페이지
router.post('/profits/:id', card.getProfitsCardById);
// 전체 카드 리스트
router.post('/cardList', card.prodCardList);
// 카드 상세 페이지
router.get('/cardList/:id', card.getProdCardById);

app.use(router.routes()).use(router.allowedMethods());

export default router;