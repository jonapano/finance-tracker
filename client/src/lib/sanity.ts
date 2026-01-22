import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "1sgrfji7",
  dataset: "development",
  useCdn: true,
  apiVersion: "2024-01-01",
});
