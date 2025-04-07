import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistanceToNow(date: Date | null): string {
  if (!date) return "Never";
  
  // Ensure date is a proper Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return "Invalid date";
  
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateRandomUsername(prefix: string): string {
  const randomNumbers = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}${randomNumbers}`;
}

export function replaceRouteParams(
  route: string,
  params: Record<string, string | number>
): string {
  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
}
