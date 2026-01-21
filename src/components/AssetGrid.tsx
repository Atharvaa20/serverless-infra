"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Search, FileText, ImageIcon, Video, File, Calendar, HardDrive } from "lucide-react";
import Image from "next/image";

interface Asset {
    assetId: string;
    fileName: string;
    fileSize: number;
    s3Url: string;
    tags?: string[];
    type?: string;
    createdAt: string;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
};

export default function AssetGrid({ assets }: { assets: Asset[] }) {
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const filteredAssets = assets.filter((asset) => {
        const nameMatch = asset.fileName.toLowerCase().includes(searchQuery.toLowerCase());
        const tagMatch = asset.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return nameMatch || tagMatch;
    });

    const getFileIcon = (type?: string) => {
        const t = type?.toLowerCase();
        if (t?.match(/(jpg|jpeg|png|webp)/)) return <ImageIcon size={24} />;
        if (t?.match(/(mp4|mov|avi)/)) return <Video size={24} />;
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

    return (
        <div className="content-wrapper">
            {/* Dynamic Search Bar */}
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
                        {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {filteredAssets.length > 0 ? (
                    <motion.div
                        className="asset-grid"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {filteredAssets.map((asset) => (
                            <motion.div
                                key={asset.assetId}
                                className="asset-card"
                                variants={item}
                            >
                                <div className="asset-preview">
                                    <span className="file-type-badge">{asset.type || 'FILE'}</span>
                                    {asset.fileName.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                        <Image
                                            src={asset.s3Url}
                                            alt={asset.fileName}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            unoptimized
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ opacity: 0.2, transform: 'scale(2)' }}>{getFileIcon(asset.type)}</div>
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
                                    <h3 className="asset-name" title={asset.fileName}>{asset.fileName}</h3>

                                    <div className="tag-container">
                                        {asset.tags && asset.tags.length > 0 ? (
                                            asset.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="tag">
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="tag" style={{ opacity: 0.4 }}>No AI tags</span>
                                        )}
                                        {asset.tags && asset.tags.length > 3 && (
                                            <span style={{ fontSize: '0.7rem', color: '#444', marginTop: '5px' }}>+{asset.tags.length - 3}</span>
                                        )}
                                    </div>

                                    <div className="asset-footer">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <HardDrive size={12} />
                                            {formatSize(asset.fileSize)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Calendar size={12} />
                                            {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'Unknown Date'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto 2rem' }}>
                            <Image
                                src="/empty-state.png"
                                alt="Empty State"
                                fill
                                style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 50px rgba(59, 130, 246, 0.2))' }}
                            />
                        </div>
                        <h2>Begin your digital journey</h2>
                        <p>Your AI-powered cloud library is empty. Upload your first asset to see the magic of automated tagging.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
