import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.LUMINA_REGION || process.env.AWS_REGION || "ap-south-1";

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.LUMINA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.LUMINA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const ddbClient = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId: process.env.LUMINA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.LUMINA_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(ddbClient);

export { s3Client, docClient };
