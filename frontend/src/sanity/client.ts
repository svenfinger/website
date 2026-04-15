// frontend/src/sanity/client.ts
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "tpji8vqv",
  dataset: "production",
  apiVersion: "2025-05-01",
  useCdn: false,
});
