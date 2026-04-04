import createClient from "openapi-fetch";
import type { paths } from "./schema";

/**
 * Typed API client for https://localhost:7258
 *
 * Usage:
 *   import { apiClient } from '@/api/client';
 *   const { data, error } = await apiClient.GET('/your/endpoint');
 *
 * Re-generate types when the backend changes:
 *   npm run generate-api
 */
export const apiClient = createClient<paths>({
  baseUrl: "https://localhost:7258/",
});
