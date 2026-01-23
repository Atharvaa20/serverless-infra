"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Search, FileText, ImageIcon, Video, File, Calendar, HardDrive, Loader2, Filter, ChevronRight, Hash, LayoutGrid, Share2, Check, Copy } from "lucide-react";
import { getShareLink } from "@/app/actions";

interface Asset {
    assetId: string;
    fileName: string;
    fileSize: number;
    s3Url: string;
    tags?: string[];
    type?: string;
    createdAt: string;
}

type CategoryType = "all" | "images" | "videos" | "documents";

export default function AssetGrid({ assets }: { assets: Asset[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
    const [sharingId, setSharingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Extract top tags for the filter
    const topTags = useMemo(() => {
        const tagCounts: Record<string, number> = {};
        assets.forEach(asset => {
            asset.tags?.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([tag]) => tag);
    }, [assets]);

    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const name = asset.fileName.split('/').pop() || asset.fileName;
            const type = asset.type?.toLowerCase() || "";

            // Search Match
            const nameMatch = name.toLowerCase().includes(searchQuery.toLowerCase());
            const tagSearchMatch = asset.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const searchMatch = nameMatch || tagSearchMatch;

            // Category Match
            let categoryMatch = true;
            if (selectedCategory === "images") categoryMatch = !!type.match(/(jpg|jpeg|png|webp|gif)/);
            if (selectedCategory === "videos") categoryMatch = !!type.match(/(mp4|mov|avi|webm)/);
            if (selectedCategory === "documents") categoryMatch = !!type.match(/(pdf|doc|docx|txt)/);

            // Tags Match
            const tagsMatch = selectedTags.length === 0 || selectedTags.every(t => asset.tags?.includes(t));

            return searchMatch && categoryMatch && tagsMatch;
        });
    }, [assets, searchQuery, selectedCategory, selectedTags]);

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

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleShare = async (asset: Asset) => {
        setSharingId(asset.assetId);
        try {
            const result = await getShareLink(asset.fileName);
            if (result.success && result.url) {
                await navigator.clipboard.writeText(result.url);
                setCopiedId(asset.assetId);
                setTimeout(() => setCopiedId(null), 3000);
            } else {
                alert("Failed to create share link: " + result.error);
            }
        } catch (err) {
            console.error("Copy error:", err);
        } finally {
            setSharingId(null);
        }
    };

    return (
        <div className="grid-layout-container">
            {/* Filter Sidebar */}
            <aside className="filter-sidebar">
                <div className="filter-section">
                    <div className="filter-header">
                        <Filter size={16} />
                        <h3>Categories</h3>
                    </div>
                    <div className="filter-options">
                        <button className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>
                            <LayoutGrid size={14} />
                            All Files
                        </button>
                        <button className={`filter-btn ${selectedCategory === 'images' ? 'active' : ''}`} onClick={() => setSelectedCategory('images')}>
                            <ImageIcon size={14} />
                            Images
                        </button>
                        <button className={`filter-btn ${selectedCategory === 'videos' ? 'active' : ''}`} onClick={() => setSelectedCategory('videos')}>
                            <Video size={14} />
                            Videos
                        </button>
                        <button className={`filter-btn ${selectedCategory === 'documents' ? 'active' : ''}`} onClick={() => setSelectedCategory('documents')}>
                            <FileText size={14} />
                            Documents
                        </button>
                    </div>
                </div>

                {topTags.length > 0 && (
                    <div className="filter-section">
                        <div className="filter-header">
                            <Hash size={16} />
                            <h3>Top Tags</h3>
                        </div>
                        <div className="tag-cloud">
                            {topTags.map(tag => (
                                <button
                                    key={tag}
                                    className={`tag-filter-pill ${selectedTags.includes(tag) ? 'active' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="filter-info">
                    <div className="info-stat">
                        <span>Visible:</span>
                        <strong>{filteredAssets.length}</strong>
                    </div>
                    <div className="info-stat">
                        <span>Total:</span>
                        <strong>{assets.length}</strong>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="grid-main-content">
                <div className="search-section">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} style={{ position: 'absolute', left: '1.5rem', opacity: 0.3 }} />
                        <input
                            type="text"
                            placeholder="Search naming or tags..."
                            className="search-input"
                            style={{ paddingLeft: '4rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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

                                        {asset.fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
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

                                        <div className="card-actions">
                                            <button
                                                className={`action-btn share-btn ${copiedId === asset.assetId ? 'success' : ''}`}
                                                onClick={() => handleShare(asset)}
                                                disabled={sharingId === asset.assetId}
                                                title="Generate 24h share link"
                                            >
                                                {sharingId === asset.assetId ? (
                                                    <Loader2 className="spinning" size={16} />
                                                ) : copiedId === asset.assetId ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <Share2 size={16} />
                                                )}
                                            </button>
                                            <a
                                                href={asset.s3Url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="action-btn view-btn"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
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

                                    {copiedId === asset.assetId && (
                                        <div className="copy-toast">Link valid for 24h copied!</div>
                                    )}
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
                            style={{ gridColumn: '1 / -1' }}
                        >
                            <img src="/empty-cloud-3d.png" alt="Empty Cloud" className="empty-state-img" />
                            <h2>No assets match your filter</h2>
                            <p>Try clearing your search or selecting "All Files" to see everything.</p>
                            <button className="clear-filters-btn" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedTags([]); }}>
                                Clear All Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
