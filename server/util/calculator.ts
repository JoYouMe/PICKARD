export class Calculator {

    // 업종별 혜택 계산
    totalBenenfit = async (industryRate: any[], industryAmount: any[]) => {
        try {
            const cards_industries = industryRate.map(row => {
                const matching_question = industryAmount.find(v => v.industry === row.industry);
                const amount = matching_question ? matching_question.amount : 0;
                const benefit_amount = row.calculator_type === 0 ? parseFloat(row.rate) * amount : parseInt(row.rate)
                return { ...row, benefit: benefit_amount };
            })
            return cards_industries
        } catch (error) {
            console.error(error)
        }
    }

    // 카드별 혜택 계산
    picking = async (cards_industries: any[], pay_avg_per_month: number) => {
        const card_total_benefits = cards_industries.reduce((acc, card) => {
            const annual_fee = card.annual_fee / 12;
            const existingCard = acc.find((existing: { prod_card_id: any }) => existing.prod_card_id === card.prod_card_id);

            if (existingCard) {
                existingCard.industrys.push({
                    industry: card.industry,
                    rate: card.rate,
                    benefit: card.benefit
                });
                existingCard.total_benefit += card.benefit;
                existingCard.picking = +((existingCard.total_benefit / (pay_avg_per_month + annual_fee)) * 100).toFixed(2);
            } else {
                acc.push({
                    ...card,
                    industrys: [{ industry: card.industry, rate: card.rate, benefit: card.benefit }],
                    total_benefit: card.benefit,
                    picking: +((card.benefit / (pay_avg_per_month + annual_fee)) * 100).toFixed(2)
                });
            }

            return acc;
        }, []);

        const sortedCards = card_total_benefits.sort((a: { picking: number }, b: { picking: number }) => b.picking - a.picking);
        return sortedCards;
    }

}
