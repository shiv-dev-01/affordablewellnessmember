export interface PaymentUpdateResponse {
  status: number;
  message: string;
}

export interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}