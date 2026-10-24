import axios from 'axios';
import type { PaymentUpdateResponse } from '../../types/payment';
import { api } from './config';

export const updateOrderPayment = async ({
  orderId,
  creditCardNumber,
  exMonth,
  exYear,
  cvv,
}: {
  orderId: string;
  creditCardNumber: string;
  exMonth: string;
  exYear: string;
  cvv: string;
}): Promise<PaymentUpdateResponse> => {
  try {
    const response = await api.post('/update_order_payment_token', {
      order_id: orderId,
      creditCardNumber,
      ex_month: exMonth,
      ex_year: exYear,
      CVV: cvv,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};