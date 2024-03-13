
import { Pool, QueryResult } from "pg";
import { KaKaoData, LoginRequest, UserCard, UserDetails, UserIndustry } from "../interfaces/IUser";
import { Database } from "../database/config";

export default class UserService {
    private db: Database;
    constructor() {
        this.db = Database.getInstance();
    }

    async registerUser(client: Pool, loginReq: LoginRequest) {
        const { username, password, user_type } = loginReq;
        try {
            const existingUser = await this.getUserByUsername(username);
            if (existingUser) {
                throw new Error('이미 등록된 유저');
            }

            const query = {
                text: `INSERT INTO users(username, password, user_type ) VALUES($1, crypt($2, gen_salt('md5')), $3) RETURNING *`,
                values: [username, password, user_type],
            };

            const result: QueryResult = await client.query(query);
            console.log('result', result.rows[0])
            return result.rows[0];
        } catch (error) {
            console.error('user 등록 실패', error)
        }
    }

    async loginUser(loginReq: LoginRequest) {
        const { username, password } = loginReq;
        try {
            const query = {
                text:
                    `SELECT user_id, username
                 FROM users WHERE username = $1 AND password = crypt($2, password)`,
                values: [username, password],
            };

            const result: QueryResult = await this.db.query(query);

            if (result.rows.length > 0) {
                return result.rows;
            } else {
                console.log('사용자를 찾을 수 없거나 비밀번호가 일치하지 않음.');
                return false;
            }
        } catch (error) {
            throw new Error('로그인 실패');
        }
    }

    async getUserByUsername(username: string) {
        try {
            const query = {
                text: 'SELECT user_id, username FROM users WHERE username = $1',
                values: [username],
            };
            const result: QueryResult = await this.db.query(query);
            if (result.rows.length > 0) {
                return result.rows[0];
            } else {
                return null
            }
        } catch (error) {
            console.error("Error during getUserByUsername:", error);
            throw new Error('username 조회 실패');
        }
    }

    async getUserByUserKakaoId(id: number) {
        try {
            const query = {
                text: 'SELECT * FROM users WHERE kakaoid = $1',
                values: [id],
            };
            const result: QueryResult = await this.db.query(query);
            if (result.rows.length > 0) {
                return result.rows[0];
            } else {
                return null
            }
        } catch (error) {
            console.error("Error during getUserByUserId:", error);
            throw new Error('kakaoid 조회 실패');
        }
    }

    async createKakaoAccount(client: Pool, userDetails: UserDetails) {
        try {
            const { id, username, profileImg } = userDetails;
            const query = {
                text: 'INSERT INTO users(username, password, kakaoid, profileimg) VALUES ($1, $2, $3, $4) RETURNING *',
                values: [username, -1, id, profileImg],
            };
            const result: QueryResult = await client.query(query)
            return result.rows[0];
        } catch (error) {
            console.error("Error during createAccount:", error);
            throw error;
        }
    }

    async kakaoLogin(id: number) {
        try {
            const result: KaKaoData = await this.getUserByUserKakaoId(id)
            return result
        } catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    }

    // 현재 보유 카드 등록
    async userCard(client: Pool, userCard: UserCard) {
        const { prod_card_id, user_id, pay_per_month } = userCard;
        try {
            const query = {
                text: 'INSERT INTO user_card( prod_card_id, user_id, pay_per_month ) VALUES ($1, $2, $3) RETURNING *',
                values: [prod_card_id, user_id, pay_per_month],
            };
            const result: QueryResult = await client.query(query)
            return result.rows[0];
        } catch (error) {
            console.error('유저 카드 등록 실패: ', error)
        }
    }

    // 현재 소비 패턴 등록
    async userIndustry(client: Pool, userIndustry: UserIndustry) {
        try {
            const { user_card_id, industry, amount } = userIndustry;
            const industry_array = industry.split(',').map(e => parseInt(e));
            const amount_array = amount.split(',').map(e => parseInt(e));

            if (industry_array.length !== amount_array.length) {
                throw new Error('industry, rate 불일치');
            }

            const results = await Promise.all(industry_array.map(async (industry_id, i) => {
                const query = {
                    text: 'INSERT INTO user_industry (user_card_id, industry, amount) VALUES ($1, $2, $3) RETURNING *',
                    values: [user_card_id, industry_id, amount_array[i]]
                };

                const result = await client.query(query);
                return result.rows[0];
            }));

            return results;

        } catch (error) {
            throw new Error('userIndustry 작성 실패')
        }
    }

    // 유저가 보유한 전체 카드 리스트
    async getUserCardList(user_id: { user_id: number }) {
        try {
            const query = {
                text: `
                SELECT user_card_id, prod_card_id, user_id, pay_per_month
                 FROM user_card WHERE user_id = $1
                `,
                values: [user_id.user_id]
            }

            const result: QueryResult = await this.db.query(query);
            return result.rows;
        } catch (error) {
            console.error('유저 카드 리스트 실패', error)
            throw error;
        }
    }

    // 유저가 보유한 카드만 조회
    async getUserCardById(user_id: number, prod_card_id: number) {
        try {
            const query = {
                text: `
                SELECT  user_card_id, prod_card_id, user_id, pay_per_month
                FROM user_card WHERE user_id = $1 AND prod_card_id = $2
                `,
                values: [user_id, prod_card_id]
            }

            const result: QueryResult = await this.db.query(query);
            return result.rows;
        } catch (error) {
            console.error('소비 패턴 조회 실패', error)
            throw error;
        }
    }

    // 유저가 보유한 카드의 혜택 조회
    async getUserCardWithBenefits(user_id: number) {
        try {
            const query = {
                text: `
                SELECT uc.user_card_id, 
                        uc.prod_card_id,
                        uc.user_id,
                        uc.pay_per_month,
                        pc.card_type,
                        pc.card_name,
                        pc.benefit_type,
                        pc.bin,
                        pc.company,
                        pc.annual_fee,
                        pc.previous_month,
                        pc.apply_url,
                        cb.card_benefits_id,
                        cb.industry,
                        cb.rate
                    FROM user_card as uc
                    JOIN prod_card as pc
                    ON uc.prod_card_id = pc.prod_card_id
					JOIN card_benefits as cb
					ON pc.prod_card_id = cb.prod_card_id
					WHERE uc.user_id = $1
                `,
                values: [user_id]
            }

            const result: QueryResult = await this.db.query(query);
            return result.rows;
        } catch (error) {
            console.error('유저 보유 카드 조회 실패', error)
            throw error;
        }
    }

    async getPostList() {
        try {
            const query = {
                text: 'SELECT * FROM posts',
            };
            const result: QueryResult = await this.db.query(query)
            return result.rows;
        } catch (error) {
            throw new Error('POST 리스트 실패');
        }
    }

    async updatePost(client: Pool, updatePost: any, postId: number) {
        const { userId, title, content } = updatePost
        try {
            const checkUserQuery = {
                text: 'SELECT * FROM posts WHERE id = $1 AND userId = $2',
                values: [postId, userId],
            };
            const checkResult = await client.query(checkUserQuery);
            if (!checkResult.rows[0]) {
                return false
            }
            const updatePostQuery = {
                text: 'UPDATE posts SET title = $1, content = $2, updated = now() WHERE id = $3 RETURNING *',
                values: [title, content, postId],
            };
            const updatedPost: QueryResult = await client.query(updatePostQuery);
            return updatedPost.rows[0];
        } catch (error) {
            throw new Error('작성자 불일치');
        }
    }

    async deletePost(client: Pool, user_id: number, user_card_id: number) {
        try {
            const checkUserQuery = {
                text: 'SELECT * FROM user_card WHERE user_card_id = $1 AND user_id = $2',
                values: [user_card_id, user_id],
            };
            const checkResult = await client.query(checkUserQuery);
            if (!checkResult) {
                throw new Error('작성자 불일치');
            }
            const query = {
                text: 'DELETE FROM user_card WHERE user_card_id = $1 RETURNING *',
                values: [user_card_id],
            };
            const deletedPost = await client.query(query);
            return deletedPost;
        } catch (error) {
            throw new Error('POST 삭제 실패');
        }
    }

    async getUserIndustry(user_card_id: any) {
        try {
            const query = {
                text: `
                SELECT 
                uc.user_card_id,
                uc.prod_card_id,
                uc.user_id,
                uc.pay_per_month,
                ui.user_industry_id,
                ui.industry,
                ui.amount
                FROM user_card as uc
                    JOIN
                    user_industry as ui
                    ON uc.user_card_id = ui.user_card_id
                    WHERE uc.user_card_id = $1
                `,
                values: [user_card_id]
            }

            const result: QueryResult = await this.db.query(query);
            return result.rows;
        } catch (error) {
            console.error('getUserIndustry 조회 실패: ', error)
        }
    }

    async getUserProdCard(prod_card_id: any) {
        try {
            const query = {
                text: `
                SELECT 
                pc.prod_card_id,
                pc.card_type,
                pc.card_name,
                pc.benefit_type,
                pc.bin,
                pc.company,
                pc.annual_fee,
                pc.previous_month,
                pc.apply_url,
                uc.user_card_id,
                uc.user_id,
                uc.pay_per_month
                FROM prod_card as pc
                    JOIN
                    user_card as uc
                    ON uc.prod_card_id = pc.prod_card_id
                    WHERE uc.prod_card_id = $1
                `,
                values: [prod_card_id]
            }

            const result = await this.db.query(query);
            console.log('유저 서비스 getUserProdCard', result.rows)
            return result.rows

        } catch (error) {
            console.error('유저 카드 + 카드 혜택', error)
        }
    }

    async getUserCard(user_card_id: number) {
        try {
            const query = {
                text: `
                SELECT 
                    uc.user_card_id,
                    uc.prod_card_id,
                    uc.user_id,
                    uc.pay_per_month,
                    pc.card_type,
                    pc.card_name,
                    pc.benefit_type,
                    pc.bin,
                    pc.company,
                    pc.annual_fee,
                    pc.previous_month,
                    pc.apply_url,
                    cb.card_benefits_id,
                    cb.industry,
                    cb.calculator_type,
                    cb.rate
                        FROM user_card as uc
                        JOIN prod_card as pc
                        ON uc.prod_card_id = pc.prod_card_id
                        JOIN card_benefits as cb
                        ON pc.prod_card_id = cb.prod_card_id
                        WHERE uc.user_card_id = $1
                `,
                values: [user_card_id]
            }

            const result = await this.db.query(query);
            return result.rows

        } catch (error) {
            console.error('유저 카드 + 카드 혜택', error)
        }
    }






}
