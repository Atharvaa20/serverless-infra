"use server";

import { s3Client, docClient } from "@/lib/aws";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function getAssets(userId?: string) {
    console.log("Fetching assets for userId:", userId);
    try {
        const tableName = process.env.DYNAMODB_TABLE_NAME;
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET;

        if (!tableName || !bucketName) {
            console.error("Missing Environment Variables");
            return [];
        }

        const command = new ScanCommand({ TableName: tableName });
        const { Items } = await docClient.send(command);

        if (!Items) return [];
        console.log(`Found ${Items.length} total items in DB`);

        // Filter by userId
        const userItems = userId ? Items.filter(item => item.userId === userId) : Items;
        console.log(`Filtered to ${userItems.length} items for user`);

        const assetsWithUrls = await Promise.all(
            userItems.map(async (item) => {
                try {
                    const getCommand = new GetObjectCommand({
                        Bucket: bucketName,
                        Key: item.fileName,
                    });
                    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

                    // Unmarshall tags if they are in the {S: "tag"} format
                    const processedTags = Array.isArray(item.tags)
                        ? item.tags.map((t: any) => typeof t === 'string' ? t : t.S || t.toString())
                        : [];

                    return {
                        ...item,
                        s3Url: signedUrl,
                        tags: processedTags
                    };
                } catch (e) {
                    console.error(`Signing error for ${item.fileName}:`, e);
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
        if (!bucketName) throw new Error("S3 Bucket Name missing");

        const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
        const s3Key = `uploads/${userId}/${Date.now()}-${cleanName}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            // Soft signature (no ContentType) to prevent 400 Bad Request
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        return { url, s3Key };
    } catch (error: any) {
        console.error("Upload URL Error:", error);
        throw new Error(error.message);
    }
}
