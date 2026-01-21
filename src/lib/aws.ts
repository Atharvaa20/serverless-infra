import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.LUMINA_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";

// Helper to get credentials safely
const getCredentials = () => {
  const accessKeyId = process.env.LUMINA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.LUMINA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.warn("⚠️ AWS Credentials missing in current environment!");
    return undefined;
  }
  return { accessKeyId, secretAccessKey };
};

const credentials = getCredentials();

const s3Client = new S3Client({
  region,
  credentials,
});

const ddbClient = new DynamoDBClient({
  region,
  credentials,
});

const docClient = DynamoDBDocumentClient.from(ddbClient);

export { s3Client, docClient };
