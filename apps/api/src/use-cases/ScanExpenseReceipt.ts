import { config } from '../infrastructure/config';

export class ScanExpenseReceipt {
  async execute(params: { receiptText: string; lang: string }): Promise<{
    amount: number;
    currency: string;
    category: string;
    description: string;
  }> {
    const prompt = `Extract expense details from this receipt text. Respond ONLY in valid JSON with no explanation.

Receipt text:
${params.receiptText}

Response schema:
{
  "amount": 0.00,
  "currency": "USD",
  "category": "food|transport|accommodation|activity|other",
  "description": "Brief description of the expense"
}`;

    try {
      const response = await fetch(`${config.OLLAMA_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.OLLAMA_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          stream: false,
        }),
      });

      if (!response.ok) {
        return this.fallbackParse(params.receiptText);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || '';

      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return this.fallbackParse(params.receiptText);
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
          currency: parsed.currency || 'USD',
          category: parsed.category || 'other',
          description: parsed.description || 'Expense',
        };
      } catch {
        return this.fallbackParse(params.receiptText);
      }
    } catch {
      return this.fallbackParse(params.receiptText);
    }
  }

  private fallbackParse(text: string): { amount: number; currency: string; category: string; description: string } {
    const amountMatch = text.match(/[\$€£¥₹]?\s*(\d+[.,]?\d{0,2})/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;

    let currency = 'USD';
    if (text.includes('€')) currency = 'EUR';
    else if (text.includes('£')) currency = 'GBP';
    else if (text.includes('¥')) currency = 'JPY';
    else if (text.includes('₹')) currency = 'INR';

    let category = 'other';
    const lowerText = text.toLowerCase();
    if (lowerText.match(/restaurant|cafe|food|lunch|dinner|breakfast|coffee/)) category = 'food';
    else if (lowerText.match(/taxi|uber|grab|bus|train|metro|flight/)) category = 'transport';
    else if (lowerText.match(/hotel|hostel|airbnb|room|stay|booking/)) category = 'accommodation';
    else if (lowerText.match(/ticket|museum|tour|entry|admission/)) category = 'activity';

    return {
      amount,
      currency,
      category,
      description: text.substring(0, 100).trim(),
    };
  }
}
