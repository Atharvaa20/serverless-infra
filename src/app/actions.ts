"use server";

import { s3Client, docClient } from "@/lib/aws";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function getAssets(userId?: string) {
    try {
        const tableName = process.env.DYNAMODB_TABLE_NAME;
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET;

        if (!tableName || !bucketName) {
            console.error("Missing DB Table or S3 Bucket env vars");
            return [];
        }

        const command = new ScanCommand({ TableName: tableName });
        const { Items } = await docClient.send(command);

        if (!Items) return [];

        // Filter by userId
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
        console.error("Critical getAssets Error:", error);
        return [];
    }
}

export async function getUploadUrl(fileName: string, fileType: string, userId: string = "guest_user") {
    try {
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET;
        const akid = process.env.LUMINA_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;

        // Verify environment before attempting SDK calls
        if (!bucketName) return { success: false, error: "Missing NEXT_PUBLIC_S3_BUCKET env var" };
        if (!akid) return { success: false, error: "AWS Access Key is missing in Amplify Environment" };

        const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
        const s3Key = `uploads/${userId}/${Date.now()}-${cleanName}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            ContentType: fileType,
        });

        // Use standard signing to prevent Signature Match errors
        const url = await getSignedUrl(s3Client, command, {
            expiresIn: 300,
        });

        return { success: true, url, s3Key };
    } catch (error: any) {
        console.error("Upload URL Error:", error);
        return { success: false, error: error.message || "Failed to generate upload URL" };
    }
}
