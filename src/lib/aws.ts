import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.LUMINA_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";

// Helper to get credentials safely
const getCredentials = () => {
  // Try all possible naming variations
  const accessKeyId =
    process.env.LUMINA_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.NEXT_PUBLIC_LUMINA_ACCESS_KEY_ID; // Fallback

  const secretAccessKey =
    process.env.LUMINA_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_LUMINA_SECRET_ACCESS_KEY; // Fallback

  if (!accessKeyId || !secretAccessKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ AWS Credentials are still missing. Attempting IAM Role fallback...");
      return undefined;
    }
    console.error("❌ CRITICAL: No AWS Credentials found in .env or Environment.");
    return undefined;
  }
  return { accessKeyId, secretAccessKey };
};

console.log("Initializing AWS Clients with Region:", region);

const s3Client = new S3Client({
  region,
  credentials: getCredentials(),
});

const ddbClient = new DynamoDBClient({
  region,
  credentials: getCredentials(),
});

const docClient = DynamoDBDocumentClient.from(ddbClient);

export { s3Client, docClient };
