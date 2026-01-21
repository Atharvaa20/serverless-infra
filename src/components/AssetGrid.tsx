"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Search, FileText, ImageIcon, Video, File, Calendar, HardDrive, Loader2 } from "lucide-react";

interface Asset {
    assetId: string;
    fileName: string;
    fileSize: number;
    s3Url: string;
    tags?: string[];
    type?: string;
    createdAt: string;
}

export default function AssetGrid({ assets }: { assets: Asset[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

    const filteredAssets = assets.filter((asset) => {
        const name = asset.fileName.split('/').pop() || asset.fileName;
        const nameMatch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const tagMatch = asset.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return nameMatch || tagMatch;
    });

    const getFileIcon = (type?: string) => {
        const t = type?.toLowerCase();
        if (t?.match(/(jpg|jpeg|png|webp|gif)/)) return <ImageIcon size={24} />;
        if (t?.match(/(mp4|mov|avi|webm)/)) return <Video size={24} />;
        if (t?.match(/(pdf|doc|docx|txt)/)) return <FileText size={24} />;
        return <File size={24} />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes || bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const handleImageLoad = (assetId: string) => {
        setLoadedImages(prev => ({ ...prev, [assetId]: true }));
    };

    return (
        <div className="content-wrapper">
            <div className="search-section">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} style={{ position: 'absolute', left: '1.5rem', opacity: 0.3 }} />
                    <input
                        type="text"
                        placeholder="Search assets, tags, or file formats..."
                        className="search-input"
                        style={{ paddingLeft: '4rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="search-results-count">
                        {filteredAssets.length} found
                    </div>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {filteredAssets.length > 0 ? (
                    <motion.div
                        key="grid"
                        className="asset-grid"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filteredAssets.map((asset) => (
                            <motion.div
                                key={asset.assetId}
                                layout
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="asset-card"
                            >
                                <div className="asset-preview">
                                    <span className="file-type-badge">{asset.type || 'FILE'}</span>

                                    {asset.fileName.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                        <>
                                            {!loadedImages[asset.assetId] && (
                                                <div className="image-loading-placeholder">
                                                    <Loader2 className="loading-spinner" size={20} />
                                                </div>
                                            )}
                                            <img
                                                src={asset.s3Url}
                                                alt={asset.fileName}
                                                onLoad={() => handleImageLoad(asset.assetId)}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    opacity: loadedImages[asset.assetId] ? 1 : 0,
                                                    transition: 'opacity 0.4s ease'
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <div style={{ opacity: 0.4, transform: 'scale(1.5)' }}>{getFileIcon(asset.type)}</div>
                                    )}

                                    <a
                                        href={asset.s3Url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view-btn"
                                        style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>

                                <div className="asset-info">
                                    <h3 className="asset-name" title={asset.fileName}>
                                        {asset.fileName.split('/').pop()}
                                    </h3>

                                    <div className="tag-container">
                                        {asset.tags && asset.tags.length > 0 ? (
                                            asset.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="tag">{tag}</span>
                                            ))
                                        ) : (
                                            <span className="tag" style={{ opacity: 0.3 }}>Refining tags...</span>
                                        )}
                                    </div>

                                    <div className="asset-footer">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <HardDrive size={12} />
                                            {formatSize(asset.fileSize)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Calendar size={12} />
                                            {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'Processing'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        className="empty-state"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="empty-state-art">📦</div>
                        <h2>No assets found</h2>
                        <p>Upload your first file to see the power of Lumina's AI tagging.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
