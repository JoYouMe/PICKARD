import { ProdCard } from "../interfaces/ICard";

export default class CardInfo {
    private cardInfo: ProdCard

    constructor(params: ProdCard) {
        this.cardInfo = {
            prod_card_id: params.prod_card_id,
            card_type: params.card_type,
            benefit_type: params.benefit_type,
            card_name: params.card_name,
            bin: params.bin,
            company: params.company,
            annual_fee: params.annual_fee,
            previous_month: params.previous_month,
            industry: params.industry,
            rate: params.rate,
            apply_url: params.apply_url
        }
    }

}