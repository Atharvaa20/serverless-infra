"use server";

import { s3Client, docClient } from "@/lib/aws";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function getAssets(userId?: string) {
    try {
        const command = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            // For personal projects, you'd add: FilterExpression: "userId = :uid", ExpressionAttributeValues: { ":uid": userId }
        });
        const { Items } = await docClient.send(command);

        if (!Items) return [];

        // We filter here for simplicity in this demo, though DynamoDB FilterExpressions are more efficient
        const userItems = userId ? Items.filter(item => item.userId === userId) : Items;

        // Generate signed URLs for each asset so the bucket can remain private
        const assetsWithUrls = await Promise.all(
            userItems.map(async (item) => {
                const getCommand = new GetObjectCommand({
                    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
                    Key: item.fileName,
                });

                // Signed URL valid for 1 hour (3600 seconds)
                const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

                return {
                    ...item,
                    s3Url: signedUrl,
                };
            })
        );

        return assetsWithUrls;
    } catch (error) {
        console.error("Error fetching assets:", error);
        return [];
    }
}

export async function getUploadUrl(fileName: string, fileType: string, userId: string = "guest_user") {
    try {
        // Sanitize filename
        const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
        const s3Key = `uploads/${userId}/${Date.now()}-${cleanName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
            Key: s3Key,
            ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        return { url, s3Key };
    } catch (error) {
        console.error("Error generating upload URL:", error);
        throw new Error("Could not generate upload URL");
    }
}

