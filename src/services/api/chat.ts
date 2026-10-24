import axios from "axios";
import type { ChatMessage } from "../../types/chat";
import { api } from "./config";
import { storage } from "../../utils/storage";

function getChatContext() {
  const email = storage.getUserData()?.email ?? "";
  const patientId = storage.getPatientId();
  const token = storage.getAuthToken();

  if (!patientId) {
    throw new Error("Patient ID not found");
  }
  if (!email) {
    throw new Error("User email not found");
  }
  if (!token) {
    throw new Error("Chat token not found");
  }

  return { email, patientId, token };
}

export const generateChatToken = async (
  email: string,
  category: string,
): Promise<{ data: string; patientId: string }> => {
  try {
    const response = await api.post("/get_tokens", {
      email,
      is_cat: category,
    });

    if (response.data.status === 1 && response.data.data) {
      return {
        data: response.data.data,
        patientId: response.data.patientId,
      };
    }
    throw new Error("Failed to generate chat token");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getChatMessages = async (): Promise<ChatMessage[]> => {
  try {
    const { email, patientId, token } = getChatContext();

    const response = await api.post("/patient_message", {
      patient_id: patientId,
      channel: "patient",
      token,
      email,
    });

    const data = response.data as {
      data?: unknown[];
      messages?: unknown[];
    };

    const rawMessages: unknown[] = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.messages)
        ? data.messages
        : [];

    return rawMessages.map((msg) => {
      const message = msg as {
        id?: string;
        message_id?: string;
        text?: string | null;
        content?: string | null;
        message?: string | null;
        user_type?: string | null;
        created_at?: string;
        timestamp?: string;
        time?: string;
        files?: ChatMessage["files"];
      };

      return {
        id: String(message.id ?? message.message_id ?? ""),
        content:
          message.text ?? message.content ?? message.message ?? null,
        sender:
          typeof message.user_type === "string" &&
          message.user_type.includes("Patient")
            ? "user"
            : "doctor",
        timestamp:
          message.created_at ??
          message.timestamp ??
          message.time ??
          new Date().toISOString(),
        files: message.files,
      };
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const sendChatMessage = async (text: string): Promise<unknown> => {
  try {
    const { email, patientId, token } = getChatContext();

    const response = await api.post("/send_patient_message", {
      patient_id: patientId,
      channel: "patient",
      token,
      email,
      text,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const sendFileMessage = async (file: File): Promise<unknown> => {
  try {
    const { email, patientId, token } = getChatContext();

    const formData = new FormData();
    formData.append("patient_id", patientId);
    formData.append("channel", "patient");
    formData.append("token", token);
    formData.append("email", email);
    formData.append("file", file);

    const response = await api.post("/send_patient_message", formData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};
