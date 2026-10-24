import axios from "axios";
import type { CartProductsResponse } from "../../types/products";
import { api } from "./config";
import { storage } from "../../utils/storage";
import { getOrderOpTestData } from "./orders";

export const getUserCartProducts = async (
  email: string,
): Promise<CartProductsResponse> => {
  try {
    const response = await api.post("/get_user_cart_products", {
      email: email,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

let inFlightCartV2: Promise<CartProductsResponse> | null = null;
let inFlightCartV2Email: string | null = null;

export const getUserCartProductsV2 = async (
  email: string,
): Promise<CartProductsResponse> => {
  if (inFlightCartV2 && inFlightCartV2Email === email) {
    return inFlightCartV2;
  }

  inFlightCartV2Email = email;
  inFlightCartV2 = (async () => {
    try {
      const response = await api.post(
        "/get_user_cart_products_v2",
        { email: email },
        { timeout: 20000 },
      );
      return response.data;
    } catch (error) {
      const timedOut =
        axios.isAxiosError(error) &&
        (error.code === "ECONNABORTED" || error.response?.status === 504);

      if (timedOut) {
        const fallback = await api.post("/get_user_cart_products", {
          email: email,
        });
        return fallback.data;
      }

      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    } finally {
      inFlightCartV2 = null;
      inFlightCartV2Email = null;
    }
  })();

  return inFlightCartV2;
};

export interface LabPdfFileResponse {
  status: number;
  message: string;
  pdf_file?: string;
  already_uploaded?: string | number;
}

export const getLabPdfFile = async (
  orderId: string,
): Promise<LabPdfFileResponse> => {
  try {
    const email = storage.getUserData()?.email ?? "";
    const response = await api.post("/get_pdf_file", {
      order_id: orderId,
      email,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export interface OrderIntakeResponse {
  status: string;
  message: string;
  data: {
    first_name: string;
    last_name: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    email: string;
    phone: string;
    therapy: string;
    stage: string;
    order_id: string;
    intake_id: string;
    unique_id: string;
    prescription_id: string | null;
    intake_form_id: string;
  };
}

export const getOrderIntakeData = async (
  orderId: string,
): Promise<OrderIntakeResponse> => {
  return getOrderOpTestData(orderId);
};
