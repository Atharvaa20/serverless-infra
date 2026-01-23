"use server";

import { s3Client, docClient } from "@/lib/aws";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function getAssets(userId?: string) {
    try {
        const tableName = process.env.DYNAMODB_TABLE_NAME;
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET;

        if (!tableName || !bucketName) return [];

        const command = new ScanCommand({ TableName: tableName });
        const { Items } = await docClient.send(command);
        if (!Items) return [];

        const userItems = userId ? Items.filter(item => item.userId === userId) : Items;

        const assetsWithUrls = await Promise.all(
            userItems.map(async (item) => {
                try {
                    const getCommand = new GetObjectCommand({
                        Bucket: bucketName,
                        Key: item.fileName,
                    });
                    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

                    const processedTags = Array.isArray(item.tags)
                        ? item.tags.map((t: any) => typeof t === 'string' ? t : t.S || t.toString())
                        : [];

                    return { ...item, s3Url: signedUrl, tags: processedTags };
                } catch (e) {
                    return null;
                }
            })
        );

        return assetsWithUrls.filter(Boolean);
    } catch (error) {
        console.error("Dashboard list error:", error);
        return [];
    }
}

export async function getUploadUrl(fileName: string, fileType: string, userId: string = "guest_user") {
    try {
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET;
        if (!bucketName) return { success: false, error: "Configuration Error: NEXT_PUBLIC_S3_BUCKET is missing" };

        const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
        const s3Key = `uploads/${userId}/${Date.now()}-${cleanName}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return { success: true, url, s3Key };
    } catch (error: any) {
        console.error("Signature Error:", error);
        return {
            success: false,
            error: error.name === 'CredentialsProviderError'
                ? "AWS Permissions Error: Please attach a Service Role to your Amplify App with S3/DynamoDB access."
                : error.message
        };
    }
}
export async function getShareLink(s3Key: string) {
    try {
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET;
        if (!bucketName) throw new Error("Bucket name missing");

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
        });

        // Generate a URL that lasts for 24 hours (86400 seconds)
        const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 });
        return { success: true, url };
    } catch (error: any) {
        console.error("Share Link Error:", error);
        return { success: false, error: error.message };
    }
}
