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

// Reverse geocoding function to get area name from coordinates
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Safii-App/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    if (data && data.address) {
      const address = data.address;
      // Build a readable address from available components
      const parts = [];

      if (address.road) parts.push(address.road);
      if (address.neighbourhood) parts.push(address.neighbourhood);
      if (address.suburb) parts.push(address.suburb);
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
      }
      if (address.state) parts.push(address.state);

      // If we have meaningful address parts, return them
      if (parts.length > 0) {
        return parts.join(", ");
      }
    }

    // If no meaningful address found, return empty string
    // This prevents coordinate strings from being stored as addresses
    return "";
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    // Return empty string on error to prevent coordinate fallback
    return "";
  }
}

// Function to format location for display
export function formatLocationForDisplay(location: any): string {
  if (typeof location === "string") {
    // If it's already a string, check if it's coordinates
    if (location.includes(",")) {
      const parts = location.split(",");
      if (
        parts.length === 2 &&
        !isNaN(parseFloat(parts[0])) &&
        !isNaN(parseFloat(parts[1]))
      ) {
        return `${parseFloat(parts[0]).toFixed(4)}, ${parseFloat(
          parts[1]
        ).toFixed(4)}`;
      }
    }
    return location;
  }

  if (location && typeof location === "object") {
    // Check if address is actually a coordinate string (e.g., "11.4327, 76.8738")
    const isCoordinateString = location.address && 
      location.address.includes(",") && 
      !isNaN(parseFloat(location.address.split(",")[0])) &&
      !isNaN(parseFloat(location.address.split(",")[1]));

    if (location.address && !isCoordinateString && location.lat && location.lng) {
      // If we have a real area name and coordinates, show "Area (lat, lng)" format
      return `${location.address} (${location.lat?.toFixed(
        4
      )}, ${location.lng?.toFixed(4)})`;
    } else if (location.address && !isCoordinateString) {
      // If we have a real area name but no coordinates, just show the address
      return location.address;
    } else if (location.lat && location.lng) {
      // Just coordinates (no meaningful address found)
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    }
  }

  return "Unknown location";
}

// Upvote functionality
export async function toggleUpvote(
  issueId: string,
  userId: string
): Promise<{ isUpvoted: boolean; upvoteCount: number }> {
  try {
    // Check if user has already upvoted this issue
    const { data: existingUpvote, error: checkError } = await supabase
      .from("issue_upvotes")
      .select("id")
      .eq("issue_id", issueId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) {
      throw new Error("Error checking upvote status: " + checkError.message);
    }

    if (existingUpvote) {
      // Remove upvote
      const { error: deleteError } = await supabase
        .from("issue_upvotes")
        .delete()
        .eq("issue_id", issueId)
        .eq("user_id", userId);

      if (deleteError) {
        throw new Error("Error removing upvote: " + deleteError.message);
      }
    } else {
      // Add upvote
      const { error: insertError } = await supabase
        .from("issue_upvotes")
        .insert({
          issue_id: issueId,
          user_id: userId,
        });

      if (insertError) {
        throw new Error("Error adding upvote: " + insertError.message);
      }
    }

    // Get updated upvote count
    const { data: upvotes, error: countError } = await supabase
      .from("issue_upvotes")
      .select("id")
      .eq("issue_id", issueId);

    if (countError) {
      throw new Error("Error getting upvote count: " + countError.message);
    }

    return {
      isUpvoted: !existingUpvote,
      upvoteCount: upvotes?.length || 0,
    };
  } catch (error) {
    console.error("Error toggling upvote:", error);
    throw error;
  }
}

export async function getUpvoteStatus(
  issueId: string,
  userId: string
): Promise<{ isUpvoted: boolean; upvoteCount: number }> {
  try {
    // Get upvote count
    const { data: upvotes, error: countError } = await supabase
      .from("issue_upvotes")
      .select("id")
      .eq("issue_id", issueId);

    if (countError) {
      throw new Error("Error getting upvote count: " + countError.message);
    }

    // Check if current user has upvoted
    const { data: userUpvote, error: userError } = await supabase
      .from("issue_upvotes")
      .select("id")
      .eq("issue_id", issueId)
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      throw new Error("Error checking user upvote: " + userError.message);
    }

    return {
      isUpvoted: !!userUpvote,
      upvoteCount: upvotes?.length || 0,
    };
  } catch (error) {
    console.error("Error getting upvote status:", error);
    return { isUpvoted: false, upvoteCount: 0 };
  }
}