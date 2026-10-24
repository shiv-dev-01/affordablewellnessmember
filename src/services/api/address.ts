import axios from "axios";
import type { BillingAddressResponse } from "../../types/orders";
import { api } from "./config";
import { storage } from "../../utils/storage";

export const getBillingAddress = async (
  orderId: string,
  email?: string,
): Promise<BillingAddressResponse> => {
  try {
    const userEmail = email ?? storage.getUserData()?.email;
    // Backend requires email, so fail fast if it's missing instead of sending an empty string.
    if (!userEmail) {
      throw new Error("User email not found. Please login again.");
    }
    const response = await api.post("/get_billing_address", {
      order_id: orderId,
      email: userEmail,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updateShippingAddress = async ({
  orderId,
  address,
  cityName,
  stateName,
  stateCode,
  userId,
  zipCode,
}: {
  orderId: string;
  address: string;
  cityName: string;
  stateName: string;
  stateCode: string;
  userId: number;
  zipCode: string;
}): Promise<{ status: number; message: string }> => {
  try {
    const response = await api.post("/update_order_contact_and_address", {
      order_id: orderId,
      address,
      city_name: cityName,
      state_name: stateCode,
      country: "US",
      zip_code: zipCode,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updateBillingAddress = async ({
  orderId,
  billingAddress,
  billingCityName,
  billingStateName,
  billingStateCode,
  billingCountry,
  billingZipCode,
  userId,
}: {
  orderId: string;
  billingAddress: string;
  billingCityName: string;
  billingStateName: string;
  billingStateCode: string;
  billingCountry: string;
  billingZipCode: string;
  userId: number;
}): Promise<{ status: number; message: string }> => {
  try {
    const response = await api.post(
      "/billing_update_order_contact_and_address",
      {
        order_id: orderId,
        billing_address: billingAddress,
        billing_city_name: billingCityName,
        billing_state_name: billingStateCode,
        billing_country: billingCountry,
        billing_zip_code: billingZipCode,
        user_id: userId,
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};
