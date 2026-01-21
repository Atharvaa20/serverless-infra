"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { getUploadUrl } from "@/app/actions";

export default function UploadButton({ userId, onUploadComplete }: { userId: string, onUploadComplete: () => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        console.log("Preparing upload for user:", userId);

        try {
            // 1. Get pre-signed URL (Soft signature)
            const { url } = await getUploadUrl(file.name, file.type, userId);

            // 2. Upload to S3
            const response = await fetch(url, {
                method: "PUT",
                body: file,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`S3 Error ${response.status}: ${errorText || 'Forbidden'}`);
            }

            console.log("Upload successful!");

            // 3. Trigger refresh after short delay
            setTimeout(() => {
                onUploadComplete();
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }, 3000);

        } catch (error: any) {
            console.error("Critical Upload Error:", error);
            alert(`Upload failed: ${error.message}`);
            setIsUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*,video/*,application/pdf"
            />
            <button
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '0.8rem',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.3s ease'
                }}
            >
                {isUploading ? (
                    <>
                        <Loader2 className="loading-spinner" size={18} />
                        Syncing...
                    </>
                ) : (
                    <>
                        <Plus size={18} strokeWidth={3} />
                        New Image
                    </>
                )}
            </button>
        </div>
    );
}
