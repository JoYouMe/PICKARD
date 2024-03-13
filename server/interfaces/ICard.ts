export interface Questions {
    user_id: number;
    question_id: number;
    card_type: number;
    benefit_type: number;
    pay_avg_per_month: number;
    industry: string;
    amount: string;
}

export interface QuestionIndustry {
    question_id: number
    industry: string;
    amount: string;
}

export interface ProfitsCard {
    user_id: number;
    start: string;
    end: string;
    benefit_type: number;
}

export interface ProdCard {
    prod_card_id: number;
    card_type: number;
    benefit_type: number;
    card_name: string;
    bin: number;
    company: number;
    annual_fee: number;
    previous_month: number;
    industry: string;
    rate: string;
    apply_url: string;
}

export interface CardBenefits {
    prod_card_id: number;
    industry: string;
    rate: string;
}

export interface UpdateProdCard {
    prod_card_id: number;
    card_type: number;
    benefit_type: number;
    card_name: string;
    bin: number;
    company: number;
    annual_fee: number;
    previous_month: number;
    apply_url: string;
}