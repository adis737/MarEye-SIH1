export interface PayPalOrder {
  id: string;
  status: string;
  amount: number;
  currency: string;
  approvalUrl?: string;
}

export interface PayPalPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  payerEmail?: string;
}

export class PayPalService {
  private static getBaseUrl(): string {
    return process.env.PAYPAL_MODE === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
  }

  private static async getAccessToken(): Promise<string | null> {
    try {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not configured');
      }

      const response = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      return null;
    }
  }

  /**
   * Create a PayPal order
   */
  static async createOrder(amount: number, currency: string = 'USD', description: string): Promise<PayPalOrder | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get PayPal access token');
      }

      const orderRequest = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            },
            description: description
          }
        ],
        application_context: {
          brand_name: 'Oceanova AI Platform',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`
        }
      };

      const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `order-${Date.now()}`,
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        status: data.status,
        amount: amount,
        currency: currency,
        approvalUrl: data.links?.find((link: any) => link.rel === 'approve')?.href
      };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      return null;
    }
  }

  /**
   * Capture a PayPal order
   */
  static async captureOrder(orderId: string): Promise<PayPalPayment | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get PayPal access token');
      }

      const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `capture-${Date.now()}`,
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const purchaseUnit = data.purchase_units?.[0];
      const payment = purchaseUnit?.payments?.captures?.[0];
      
      return {
        id: payment?.id || '',
        status: payment?.status || '',
        amount: parseFloat(payment?.amount?.value || '0'),
        currency: payment?.amount?.currency_code || 'USD',
        payerEmail: data.payer?.email_address
      };
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      return null;
    }
  }

  /**
   * Get order details
   */
  static async getOrderDetails(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get PayPal access token');
      }

      const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`PayPal API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching PayPal order details:', error);
      return null;
    }
  }

  /**
   * Refund a PayPal payment
   */
  static async refundPayment(captureId: string, amount?: number, reason: string = 'Refund requested') {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get PayPal access token');
      }

      const refundRequest: any = {
        amount: amount ? {
          value: amount.toFixed(2),
          currency_code: 'USD'
        } : undefined,
        note_to_payer: reason
      };

      const response = await fetch(`${this.getBaseUrl()}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `refund-${Date.now()}`,
        },
        body: JSON.stringify(refundRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing PayPal refund:', error);
      return null;
    }
  }

  /**
   * Convert INR to USD (simplified conversion)
   */
  static convertINRToUSD(inrAmount: number): number {
    // This is a simplified conversion rate - in production, use real-time rates
    const exchangeRate = 0.012; // 1 INR = 0.012 USD (approximate)
    return Math.round(inrAmount * exchangeRate * 100) / 100;
  }
}