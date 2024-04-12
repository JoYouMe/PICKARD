import { Pool, QueryResult } from "pg";
import { Database } from "../database/config";
import { ProdCard, QuestionIndustry, Questions } from "../interfaces/ICard";

export default class CardService {
    private db: Database;
    private profitsArray: string[];

    constructor() {
        this.db = Database.getInstance();
        this.profitsArray = [];
    }

    /**
     * @description [기본] 필수 입력 항목 (카드 유형, 혜택 유형, 월 평균 소비 금액)을 저장하는 메서드
     * @param {Questions} questions - 사용자가 제출한 필수 입력 항목에 대한 객체
     * @returns {Promise<Questions>} - 저장된 질문에 대한 객체를 포함하는 Promise
     * @throws {Error} - 저장 실패 시 예외 발생
     */

    async questionBasic(client: Pool, questions: Questions, user_id: number) {
        try {
            const { card_type, benefit_type, pay_avg_per_month } = questions;
            const query = {
                text: 'INSERT INTO questions (user_id, card_type, benefit_type, pay_avg_per_month) VALUES ($1, $2, $3, $4) RETURNING *',
                values: [user_id, card_type, benefit_type, pay_avg_per_month]
            }

            const result: QueryResult = await client.query(query);
            console.log(result.rows[0].question_id)
            return result.rows[0];

        } catch (error) {
            console.error('questions 작성 실패', error)
        }
    }

    /**
     * @description [개인화] 정확한 추천을 위한 소비패턴 입력 항목 (업종, 금액)을 저장하는 메서드
     * @param {QuestionIndustry} questionIndustry - 사용자가 제출한 개인화 입력 항목에 대한 객체
     * @throws {Error} - industry, rate 불일치 시 예외 발생
     * @throws {Error} - 저장 실패 시 예외 발생
     */

    async questionIndustry(client: Pool, questionIndustry: QuestionIndustry) {
        try {
            const { question_id, industry, amount } = questionIndustry;
            const industry_array = industry.split(',').map(e => parseInt(e));
            const amount_array = amount.split(',').map(e => parseInt(e));

            if (industry_array.length !== amount_array.length) {
                throw new Error('industry, rate 불일치');
            }

            const results = await Promise.all(industry_array.map(async (industry_id, i) => {
                const query = {
                    text: 'INSERT INTO question_industry (question_id, industry, amount) VALUES ($1, $2, $3) RETURNING *',
                    values: [question_id, industry_id, amount_array[i]]
                };

                const result = await client.query(query);
                return result.rows[0];
            }));

            return results;

        } catch (error) {
            console.error('questionIndustry 작성 실패', error)
        }
    }

    /** questions + question_industry | question_id로 조인| 소비 패턴 비교 조건 생성
     * @description 사용자가 제출한 소비패턴을 조회하는 메서드
     * @param {number} question_id 
     * @returns 
     */

    async getQuestion(question_id: number) {
        try {
            const query = {
                text: `
                SELECT q.question_id, q.benefit_type, q.pay_avg_per_month, q.card_type, qi.industry, qi.amount
                FROM questions as q
                    JOIN
                    question_industry as qi
                    ON q.question_id = qi.question_id
                    WHERE q.question_id = $1
                `,
                values: [question_id]
            }

            const result: QueryResult = await this.db.query(query);
            return result.rows;
        } catch (error) {
            console.error('소비 패턴 조회 실패', error)
            throw error;
        }
    }

    /** prod_card + card_benefit | prod_card_id로 조인 | 조건 비교 대상 생성
     *  카드 유형, 혜택 유형, 전월실적까지 비교
     * @description 사용자의 소비패턴 조건과 일치하는 카드 상품을 조회하는 메서드
     * @param questionQueryResult 
     * @returns 
     */

    async profitsList(questionQueryResult: Questions[]) {
        try {
            const { card_type, benefit_type, pay_avg_per_month } = questionQueryResult[0];
            const query = {
                text: `
                    SELECT 
                        p.prod_card_id,
                        p.card_type,
                        p.card_name,
                        p.benefit_type,
                        p.bin,
                        p.company,
                        p.annual_fee,
                        p.previous_month,
                        p.apply_url,
                        cb.card_benefits_id,
                        cb.industry,
                        cb.rate,
                        cb.calculator_type
                    FROM prod_card as p
                        JOIN
                        card_benefits as cb
                        ON p.prod_card_id = cb.prod_card_id
                        WHERE p.card_type = $1 AND p.benefit_type = $2 AND p.previous_month <= $3
                    `,
                values: [card_type, benefit_type, pay_avg_per_month]
            };
            const result: QueryResult = await this.db.query(query);
            const industry_array = questionQueryResult.map((e) => e.industry);
            const filtered_rows = result.rows.filter(e => industry_array.includes(e.industry));
            return filtered_rows
        } catch (error) {
            console.error('카드 추천 실패', error)
        }
    }

    // 추천 카드  상세 페이지 
    async profitsById(id: number) {
        try {
            const cardsList = this.profitsArray
            console.log(cardsList)
            const selectedCard = cardsList.find((card: { prod_card_id: number; }) => card.prod_card_id === id);

            if (!selectedCard) {
                throw new Error('Card not found');
            }

            return selectedCard;
        } catch (error) {
            console.error('POST 조회 실패', error)
        }
    }

    async prodCardList() {
        try {
            const query =
                `SELECT 
                    p.prod_card_id,
                    p.card_type,
                    p.card_name,
                    p.benefit_type,
                    p.bin,
                    p.company,
                    p.annual_fee,
                    p.previous_month,
                    p.apply_url,
                    cb.card_benefits_id,
                    cb.industry,
                    cb.rate
                FROM prod_card as p
                    JOIN
                    card_benefits as cb
                    ON p.prod_card_id = cb.prod_card_id`

            const result: QueryResult = await this.db.query(query)
            return result.rows;
        } catch (error) {
            console.error('prodCardList 리스트 실패', error)
        }
    }

    async prodCardById(prod_card_id: number) {
        try {
            const query = {
                text: `
                    SELECT 
                    p.prod_card_id,
                    p.card_type,
                    p.card_name,
                    p.benefit_type,
                    p.bin,
                    p.company,
                    p.annual_fee,
                    p.previous_month,
                    p.apply_url,
                    cb.card_benefits_id,
                    cb.industry,
                    cb.rate
                    FROM prod_card as p
                    JOIN card_benefits as cb ON p.prod_card_id = cb.prod_card_id
                    WHERE p.prod_card_id = $1
                `,
                values: [prod_card_id]
            };

            const result: QueryResult = await this.db.query(query);

            return result.rows.reduce((acc, row) => {
                const existingCard = acc.find((card: { prod_card_id: number; }) => card.prod_card_id === row.prod_card_id);

                if (existingCard) {
                    existingCard.industry.push({
                        industry: row.industry,
                        rate: row.rate
                    });
                } else {
                    acc.push({
                        ...row,
                        industry: [{ industry: row.industry, rate: row.rate }]
                    });
                }

                return acc;
            }, []);
        } catch (error) {
            console.error('POST 조회 실패', error)
        }
    }




}
