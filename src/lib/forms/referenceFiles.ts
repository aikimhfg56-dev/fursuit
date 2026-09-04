/** Shared by the commission quote form (client) and /api/forms/quote (server) so the limits can't drift apart. */
export const MAX_REFERENCE_FILES = 5;
export const MAX_REFERENCE_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB per file
export const MAX_REFERENCE_TOTAL_SIZE_BYTES = 20 * 1024 * 1024; // 20MB total (email attachment budget)

export const REFERENCE_FILE_ACCEPT = "image/*,application/pdf";
