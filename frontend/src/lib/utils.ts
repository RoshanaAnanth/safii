import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import supabase from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API utility functions
export const API_BASE_URL = "http://localhost:5000";

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export async function uploadImage(
  file: File,
  userId: string,
  reportTitle: string
) {
  const filePath = `${userId}/${reportTitle}-${file.name}`;
  console.log("File path for upload:", filePath);

  const { data, error } = await supabase.storage
    .from("report-images")
    .upload(filePath, file);

  if (error) {
    throw new Error("Image upload failed: " + error.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("report-images")
    .getPublicUrl(filePath);

  return urlData?.publicUrl || null;
}
