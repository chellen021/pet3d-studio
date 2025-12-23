import { getSystemConfig } from '../lib/database';

const PAYPAL_API_URL = 'https://api-m.paypal.com';

interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
}

async function getCredentials(): Promise<PayPalCredentials> {
  const clientId = await getSystemConfig('PAYPAL_CLIENT_ID');
  const clientSecret = await getSystemConfig('PAYPAL_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }
  
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = await getCredentials();
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${error}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

export interface CreateOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface CaptureOrderResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
  payer: {
    email_address: string;
    payer_id: string;
  };
}

/**
 * Create a PayPal order
 * @param amount Amount in USD (number)
 * @param orderNumber Internal order number for reference
 * @param returnUrl URL to redirect after approval
 * @param cancelUrl URL to redirect if cancelled
 */
export async function createPayPalOrder(
  amount: number,
  orderNumber: string,
  returnUrl: string,
  cancelUrl: string
): Promise<CreateOrderResponse> {
  const accessToken = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderNumber,
        description: `Pet3D Studio - 3D Print Order ${orderNumber}`,
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        }
      }],
      application_context: {
        brand_name: 'Pet3D Studio',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal create order failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Capture a PayPal order after user approval
 * @param orderId PayPal order ID
 */
export async function capturePayPalOrder(orderId: string): Promise<CaptureOrderResponse> {
  const accessToken = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal capture failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Get PayPal order details
 * @param orderId PayPal order ID
 */
export async function getPayPalOrder(orderId: string): Promise<unknown> {
  const accessToken = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal get order failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Get the approval URL from PayPal order response
 */
export function getApprovalUrl(orderResponse: CreateOrderResponse): string | undefined {
  const approvalLink = orderResponse.links.find(link => link.rel === 'approve');
  return approvalLink?.href;
}
