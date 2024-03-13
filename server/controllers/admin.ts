import { Context } from 'koa';
import AdminService from '../services/adminService';
import { Database } from '../database/config';
import { ProdCard } from '../interfaces/ICard';
import CardService from '../services/cardService';
export default class Admin {
  private readonly adminService: AdminService;
  private readonly cardService: CardService;
  private db: Database;

  constructor() {
    this.adminService = new AdminService();
    this.cardService = new CardService()
    this.db = Database.getInstance();
  }

  // 카드 상품 등록
  createProdCard = async (ctx: Context) => {
    const client = await this.db.connect();
    const prodCard = ctx.request.body as ProdCard
    try {
      await client.query('BEGIN');
      const createProdCard = await this.adminService.createProdCard(prodCard);
      const cardBenefits = { prod_card_id: createProdCard.prod_card_id, industry: prodCard.industry, rate: prodCard.rate }
      const createProdCardBenefit = await this.adminService.createProdCardBenefits(cardBenefits)
      await client.query('COMMIT');
      ctx.body = { success: true, result: createProdCard, benefits: createProdCardBenefit };
      return { createProdCardBenefit }
    } catch (error) {
      console.error('Error during createProdCard:', error);
      await client.query('ROLLBACK');
      ctx.body = { success: false, message: 'POST 작성 실패' };
    } finally {
      client.release();
    }
  }

  // 카드 상품 수정
  updateProdCard = async (ctx: Context) => {
    const { prodCardId } = ctx.params;
    const prodCard = ctx.request.body as ProdCard
    const basic = {
      prod_card_id: prodCardId,
      card_type: prodCard.card_type,
      benefit_type: prodCard.benefit_type,
      card_name: prodCard.card_name,
      bin: prodCard.bin,
      company: prodCard.company,
      annual_fee: prodCard.annual_fee,
      previous_month: prodCard.previous_month,
      apply_url: prodCard.apply_url
    }
    const benefit = {
      prod_card_id: prodCardId,
      industry: prodCard.industry,
      rate: prodCard.rate
    }
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const getByPordCardId = await this.adminService.updateProdCard(basic)
      const updatedProdCard = await this.adminService.updateProdCardBenefits(benefit);
      if (!getByPordCardId || !updatedProdCard) {
        ctx.body = { success: false, message: '카드 상품 수정 실패' };
      } else {
        await client.query('COMMIT');
        ctx.body = { success: true, result: updatedProdCard };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during update post:', error);
      ctx.body = { success: false, message: '카드 상품 수정 실패' };
    } finally {
      client.release();
    }
  }

  // 카드 상품 삭제
  deleteProdCard = async (ctx: Context) => {
    const { prodCardId } = ctx.params;
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const deletedProdCard = await this.adminService.deleteProdCard(prodCardId);
      if (!deletedProdCard) {
        await client.query('COMMIT');
        ctx.body = { success: true, result: deletedProdCard };
      } else {
        ctx.body = { success: false, result: deletedProdCard };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during delete post:', error);
      ctx.body = { success: false, message: 'POST 삭제 실패' };
    } finally {
      client.release();
    }
  }

}
