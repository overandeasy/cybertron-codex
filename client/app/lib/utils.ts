import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ApiResponse } from "~/type/apiResponse";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function handleApiError(errorData: ApiResponse<null>): Error {
  const error = new Error(errorData.message || "Unknown error");   // The Error constructor makes sure a real Error instance is created, so stack traces, logging tools, and instanceof Error checks behave correctly.
  return Object.assign(error, errorData); // Assign the errorData properties to the error instance (the previous inclusion of errorData.message in the Error constructor was necessary, not redundant). See project-note.md for more details.
}

export function isApiError(error: unknown): error is Error & ApiResponse<null> {
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

// Use native Intl.NumberFormat for currency formatting elsewhere in the app.
// Helper removed per design change request.

export const ALL_CURRENCIES = [
  // Major currencies on top
  'AUD', 'CNY', 'EUR', 'GBP', 'HKD', 'USD',
  // Full list (partial but diverse) alphabetical
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'FJD', 'FKP', 'FOK', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL'
];