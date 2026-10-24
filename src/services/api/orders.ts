import axios from "axios";
import type {
  OrderDetailsResponse,
  OrdersResponse,
  OrderOpTestResponse,
} from "../../types/orders";
import {
  api,
  SITE_ID,
  whitelabelApi180,
  mdIntegrationsApi,
} from "./config";
import { storage } from "../../utils/storage";

export const getUserOrders = async (
  userId: number,
  email: string,
): Promise<OrdersResponse> => {
  try {
    const response = await api.post("/get_user_conform_cart_product", {
      user_id: userId,
      email,
    });

    // Save the product category if available in the first order
    if (
      response.data.status === 1 &&
      response.data.product?.[0]?.product_category_name
    ) {
      storage.setProductCategory(
        response.data.product[0].product_category_name,
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getOrderDetails = async (
  orderId: string,
): Promise<OrderDetailsResponse> => {
  try {
    const email = storage.getUserData()?.email ?? "";
    const response = await api.post("/get_user_cart_product_details", {
      order_id: orderId,
      email,
    });

    // Update product category if available
    if (
      response.data.status === 1 &&
      response.data.product?.[0]?.product_category_name
    ) {
      storage.setProductCategory(
        response.data.product[0].product_category_name,
      );
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

const inFlightOrderOp = new Map<string, Promise<OrderOpTestResponse>>();

export const getOrderOpTestData = async (
  orderId: string,
): Promise<OrderOpTestResponse> => {
  const existing = inFlightOrderOp.get(orderId);
  if (existing) {
    return existing;
  }

  const request = (async () => {
    const userData = storage.getUserData();
    if (!userData?.email) {
      throw new Error("User data not found");
    }

    const response = await api.get<OrderOpTestResponse>(
      `/getOrderOpTest/${SITE_ID}/${orderId}`,
      {
        params: {
          email: userData.email,
        },
      },
    );
    return response.data;
  })().finally(() => {
    inFlightOrderOp.delete(orderId);
  });

  inFlightOrderOp.set(orderId, request);

  try {
    return await request;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export interface UploadFileRequest {
  allow_retest: number;
  note: string;
  user: string;
  upload_name: string;
  file_name: string;
  file_ext: string;
  file_contents: string;
  debug: boolean;
}

export interface UploadFileResponse {
  status: string;
  message: string;
  data?: any;
}

export const uploadFullBodyImage = async (
  orderId: string,
  file: File,
): Promise<UploadFileResponse> => {
  return uploadImageFile(orderId, file, "FULLBODY");
};

export const uploadIdImage = async (
  orderId: string,
  file: File,
): Promise<UploadFileResponse> => {
  return uploadImageFile(orderId, file, "ID");
};

export const uploadPrescriptionImage = async (
  orderId: string,
  file: File,
): Promise<UploadFileResponse> => {
  return uploadImageFile(orderId, file, "PRESCRIPTION");
};

export const uploadImageFile = async (
  orderId: string,
  file: File,
  uploadName: "FULLBODY" | "ID" | "PRESCRIPTION",
): Promise<UploadFileResponse> => {
  try {
    // Convert file to base64
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Extract file extension
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";

    // Prepare request body
    const requestBody: UploadFileRequest = {
      allow_retest: 1,
      note: "manually handling",
      user: "user",
      upload_name: uploadName,
      file_name: file.name,
      file_ext: fileExt,
      file_contents: base64String, // Already includes data:image/jpeg;base64, prefix
      debug: false,
    };

    const response = await whitelabelApi180.post(
      `/order/${orderId}/upload-file`,
      requestBody,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export interface IdentityRecheckRequest {
  user: string;
  debug: number;
  last4: string;
}

export interface IdentityRecheckResponse {
  status: string;
  message: string;
  data?: any;
}

export const submitIdentityRecheck = async (
  orderId: string,
  last4: string,
): Promise<IdentityRecheckResponse> => {
  try {
    const requestBody: IdentityRecheckRequest = {
      user: "user",
      debug: 0,
      last4: last4,
    };

    const response = await mdIntegrationsApi.post(
      `/order/${orderId}/identity-recheck-with-ssn`,
      requestBody,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};
