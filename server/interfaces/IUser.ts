export interface LoginRequest {
    username: string;
    password: string;
    user_type: number;
}

export interface DecodedToken {
    username: string;
}

export interface UserDetails {
    id: number;
    username: string;
    profileImg: string

}

export interface KaKaoData {
    id: number;
    username: string;
    kakaoid: string;
    profileimg: string;
    created: Date;
    updated?: Date;
    user_type: number;
}

export interface UserCard {
    prod_card_id: number;
    user_id: number;
    pay_per_month: number;
    industry: string;
    amount: string;
}

export interface UserIndustry {
    user_card_id: number
    industry: string;
    amount: string;
}