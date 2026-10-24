import { useState, useEffect, useCallback } from "react";
import {
  sendChatMessage,
  getChatMessages,
  sendFileMessage,
  generateChatToken,
} from "../services/api";
import type { Message } from "../types";
import { storage } from "../utils/storage";

interface UseChatProps {
  productCategory?: string;
}

export function useChat({ productCategory }: UseChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const chatMessages = await getChatMessages();
      setMessages(
        chatMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
          files: msg.files,
        })),
      );
      setError(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load messages";
      console.error("Failed to fetch messages:", error);
      setError(message);
    }
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      const userData = storage.getUserData();
      if (!productCategory || !userData?.email) return;

      try {
        setIsLoading(true);
        setError(null);

        const tokenResponse = await generateChatToken(
          userData.email,
          productCategory,
        );

        if (tokenResponse.data) {
          storage.setAuthToken(tokenResponse.data);
        }

        if (tokenResponse.patientId) {
          storage.setPatientId(tokenResponse.patientId);
        }

        await fetchMessages();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to initialize chat";
        console.error("Failed to initialize chat:", error);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [productCategory, fetchMessages]);

  const sendMessage = async (message: { type: "text"; content: string }) => {
    const authToken = storage.getAuthToken();
    if (!authToken) {
      setError("Chat not initialized");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const userMessage: Message = {
        id: Date.now().toString(),
        content: message.content,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      await sendChatMessage(message.content);
      await fetchMessages();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      setError(message);
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const authToken = storage.getAuthToken();
    if (!authToken) {
      setError("Chat not initialized");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await sendFileMessage(file);
      await fetchMessages();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to upload file";
      setError(message);
      console.error("Failed to upload file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    handleFileUpload,
    isLoading,
    error,
  };
}
