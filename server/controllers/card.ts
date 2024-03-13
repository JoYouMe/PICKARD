import { Database } from '../database/config';
import CardService from '../services/cardService';
import { Questions } from '../interfaces/ICard';
import { Context } from 'koa';
import { Calculator } from '../util/calculator';
import { v4 as uuidv4 } from 'uuid';
import * as ejs from 'ejs';
import * as fs from 'fs';


export default class Card {
  private readonly cardService: CardService;
  private db: Database;
  private calculator: Calculator;

  constructor() {
    this.cardService = new CardService();
    this.db = Database.getInstance();
    this.calculator = new Calculator();
  }


  // 소비 패턴 작성
  questions = async (ctx: Context) => {
    const client = await this.db.connect();
    const questions = ctx.request.body as Questions
    const user_id = ctx.cookies.get('userId') || uuidv4();
    console.log('user_id', user_id)
    try {
      await client.query('BEGIN');
      const createdQuestions = await this.cardService.questionBasic(client, questions, user_id);
      const questionIndustry = { question_id: createdQuestions.question_id, industry: questions.industry, amount: questions.amount }
      await this.cardService.questionIndustry(client, questionIndustry)
      await client.query('COMMIT');
      const getQuestion: any = await this.cardService.getQuestion(questionIndustry.question_id)
      const benefitArray: any = {};
      getQuestion.forEach((e: any) => {
        benefitArray[e.industry] = e.amount;
      });
      const result: any = {
        ...createdQuestions,
        benefit: benefitArray
      };
      ctx.cookies.set('userId', user_id, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });
      ctx.body = { success: true, result };
    } catch (error) {
      console.error('Error during create questions:', error);
      await client.query('ROLLBACK');
      ctx.body = { success: false, message: 'questions 작성 실패' };
    } finally {
      client.release();
    }
  }

  // 소비 패턴 조회
  getQuestions = async (ctx: Context) => {
    try {
      let questionId = ctx.request.body as number
      const getQuestion = await this.cardService.getQuestion(questionId)
      if (!getQuestion) {
        throw new Error('questionId 조회 실패');
      }
      const result: any = {};
      getQuestion.forEach((e: any) => {
        result[e.industry] = e.amount;
      });
      ctx.body = { success: true, result };
    } catch (error) {
      console.error('Error during getQuestions:', error);
      ctx.body = { success: false, message: 'getQuestions 실패' };
    }
  }

  // 추천 카드 목록
  profitsList = async (ctx: Context) => {
    try {
      const questionId = ctx.request.body as { question_id: number }
      const getQuestion = await this.cardService.getQuestion(questionId.question_id)
      if (!getQuestion) {
        throw new Error('questionId 조회 실패');
      }
      const profitsList = await this.cardService.profitsList(getQuestion);
      if (!profitsList) {
        throw new Error('profitsList 조회 실패')
      }
      const benefits = await this.calculator.totalBenenfit(profitsList, getQuestion)
      if (!benefits) {
        throw new Error('benefits 조회 실패')
      }
      const pickingResult = await this.calculator.picking(benefits, getQuestion[0].pay_avg_per_month)
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


  // 추천 카드 상세 페이지
  getProfitsCardById = async (ctx: Context) => {
    const { id } = ctx.params;
    try {
      const questionId = ctx.request.body as any
      const getQuestion = await this.cardService.getQuestion(questionId)
      if (!getQuestion) {
        throw new Error('questionId 조회 실패');
      }
      const profitsList = await this.cardService.profitsList(getQuestion);

      if (!profitsList) {
        throw new Error('questionId 조회 실패');
      }
      const profitCard = profitsList.filter((e: any) => {
        e.prod_card_id === id
      })
      console.log(profitCard)
      ctx.body = { success: true, result: profitCard };
    } catch (error) {
      console.error('Error during get prodCard by id:', error);
      ctx.body = { success: false, message: 'PROD CARD 조회 실패' };
    }
  }


  // 전체 카드 리스트
  prodCardList = async (ctx: Context) => {
    try {
      const prodCardList = await this.cardService.prodCardList();
      ctx.body = { success: true, result: prodCardList };
    } catch (error) {
      console.error('Error during get prod_card list:', error);
      ctx.body = { success: false, message: 'PROD CARD 리스트 실패' };
    }
  }

  // 카드 상세 페이지
  getProdCardById = async (ctx: Context) => {
    const { id } = ctx.params;
    try {
      const prodCard = await this.cardService.prodCardById(id);
      ctx.body = { success: true, result: prodCard };
    } catch (error) {
      console.error('Error during get prodCard by id:', error);
      ctx.body = { success: false, message: 'PROD CARD 조회 실패' };
    }
  }

  // views
  renderRecommendation = async (cardsList: any[]) => {
    const templatePath = './server/views/main.ejs';
    const template = fs.readFileSync(templatePath, 'utf-8');
    const renderedHtml = ejs.render(template, { cardsList });

    return renderedHtml;
  }

  renderCardDetails = async (selectedCard: any) => {
    const templatePath = './server/views/card-details.html';
    const template = fs.readFileSync(templatePath, 'utf-8');
    const renderedHtml = ejs.render(template, { selectedCard });

    return renderedHtml;
  }


}
