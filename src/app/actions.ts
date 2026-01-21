"use server";

import { s3Client, docClient } from "@/lib/aws";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function getAssets(userId?: string) {
    console.log("--- ASSET FETCH DEBUG ---");
    console.log("Current User ID:", userId);
    console.log("DB Table:", process.env.DYNAMODB_TABLE_NAME ? "PRESENT" : "MISSING");
    console.log("S3 Bucket:", process.env.NEXT_PUBLIC_S3_BUCKET ? "PRESENT" : "MISSING");
    console.log("LUMINA_ACCESS_KEY:", process.env.LUMINA_ACCESS_KEY_ID ? "PRESENT" : "MISSING");

    try {
        const tableName = process.env.DYNAMODB_TABLE_NAME;
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET;

        if (!tableName || !bucketName) return [];

        const command = new ScanCommand({ TableName: tableName });
        const { Items } = await docClient.send(command);

        if (!Items) return [];

        // USER FILTERING
        // We filter by userId. If no userId matches, this will return [].
        // To debug, you can log the first item's userId:
        if (Items.length > 0) console.log("First item in DB has userId:", Items[0].userId);

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

                    return {
                        ...item,
                        s3Url: signedUrl,
                        tags: processedTags
                    };
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
    console.log("--- UPLOAD URL START ---");
    console.log("Bucket:", process.env.NEXT_PUBLIC_S3_BUCKET);
    console.log("AKID Length:", (process.env.LUMINA_ACCESS_KEY_ID || "").length);

    try {
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET;
        if (!bucketName) throw new Error("Bucket Env Var is Missing");
        if (!process.env.LUMINA_ACCESS_KEY_ID) throw new Error("AWS Credentials (AKID) are Missing in Amplify Console");

        const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
        const s3Key = `uploads/${userId}/${Date.now()}-${cleanName}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            ContentType: fileType, // Back to setting content type for better S3 handling
        });

        // We use a simpler signing approach to avoid AuthorizationQueryParametersError
        const url = await getSignedUrl(s3Client, command, {
            expiresIn: 300,
            signableHeaders: new Set(["host", "content-type"])
        });

        return { url, s3Key };
    } catch (error: any) {
        console.error("Upload URL Generation Failed:", error);
        throw new Error(error.message);
    }
}
