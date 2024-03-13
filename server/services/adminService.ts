
import { QueryResult } from "pg";
import { Database } from "../database/config";
import { CardBenefits, ProdCard, UpdateProdCard } from "../interfaces/ICard";

export default class AdminService {
    private db: Database;
    constructor() {
        this.db = Database.getInstance();
    }

    // 카드 상품 등록
    async createProdCard(prodCard: ProdCard) {
        const { card_type, benefit_type, card_name, bin, company, annual_fee, previous_month, apply_url } = prodCard;
        try {
            const query = {
                text: 'INSERT INTO prod_card( card_type, benefit_type, card_name, bin, company, annual_fee, previous_month, apply_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                values: [card_type, benefit_type, card_name, bin, company, annual_fee, previous_month, apply_url],
            };
            const result: QueryResult = await this.db.query(query)
            return result.rows[0];
        } catch (error) {
            throw new Error('ProdCard 작성 실패');
        }
    }


    // 카드 혜택 삽입 쿼리
    async createProdCardBenefits(cardBenefits: CardBenefits) {
        try {
            const { prod_card_id, industry, rate } = cardBenefits;
            const industry_array = industry.split(',').map(e => parseInt(e));
            const rate_array = rate.split(',').map(e => parseFloat(e));

            if (industry_array.length !== rate_array.length) {
                throw new Error('industry, rate 불일치');
            }

            const results = await Promise.all(industry_array.map(async (industry_id, i) => {
                const query = {
                    text: 'INSERT INTO card_benefits (prod_card_id, industry, rate) VALUES ($1, $2, $3) RETURNING *',
                    values: [prod_card_id, industry_id, rate_array[i]]
                };

                const result = await this.db.query(query);
                return result.rows[0];
            }));

            return results;
        } catch (error) {
            throw new Error('ProdCardBenefits 작성 실패')
        }
    }

    // 카드 상품 수정
    async updateProdCard(prodCard: UpdateProdCard) {
        const { prod_card_id, card_type, card_name, bin, company, annual_fee, previous_month, apply_url } = prodCard;
        try {
            const query = {
                text: 'UPDATE prod_card SET prod_card_id = $1, card_type = $2, card_name = $3, bin = $4, company = $5, annual_fee = $6, previous_month =$7, apply_url = $8 RETURNING *',
                values: [prod_card_id, card_type, card_name, bin, company, annual_fee, previous_month, apply_url],
            };
            const result: QueryResult = await this.db.query(query)
            console.log('updateProdCard', result.rows)
            return result.rows[0];
        } catch (error) {
            throw new Error('ProdCard 작성 실패');
        }
    }

    // 카드 혜택 업데이트 쿼리
    async updateProdCardBenefits(cardBenefits: CardBenefits) {
        try {
            const { prod_card_id, industry, rate } = cardBenefits;
            const industry_array = industry.split(',').map(e => parseInt(e));
            const rate_array = rate.split(',').map(e => parseFloat(e));

            if (industry_array.length !== rate_array.length) {
                throw new Error('industry, rate 불일치');
            }

            const results = await Promise.all(industry_array.map(async (industry_id, i) => {
                const query = {
                    text: 'UPDATE card_benefits prod_card_id = $1, industry = $2, rate = $3 RETURNING *',
                    values: [prod_card_id, industry_id, rate_array[i]]
                };

                const result = await this.db.query(query);
                console.log('updateProdCardBenefits', result.rows)
                return result.rows[0];
            }));

            return results;
        } catch (error) {
            throw new Error('ProdCardBenefits 작성 실패')
        }
    }

    async deleteProdCard(prod_card_id: number) {
        try {

            const query = {
                text: 'DELETE FROM prod_card WHERE prod_card_id = $1 RETURNING *',
                values: [prod_card_id],
            };
            const deletedPost = await this.db.query(query);
            return deletedPost;
        } catch (error) {
            throw new Error('POST 삭제 실패');
        }
    }
}
