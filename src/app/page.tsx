"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import UploadButton from "@/components/UploadButton";
import AssetGrid from "@/components/AssetGrid";
import { useEffect, useState } from "react";
import { getAssets } from "./actions";
import { LayoutGrid, Cloud, ShieldCheck, LogOut, Settings, User, Menu, X, RefreshCcw, HardDrive, Shield, Zap, Cpu, Lock } from "lucide-react";

type TabType = "all" | "storage" | "security" | "profile" | "settings" | "guide";

function DashboardContent({ user, signOut }: { user: any; signOut: any }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const fetchAssets = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      const userId = user?.userId || user?.username;
      const data = await getAssets(userId);
      setAssets(data as any);
    } catch (error) {
      console.error("Dashboard refresh error:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setTimeout(() => fetchAssets(true), 1500);
    setTimeout(() => fetchAssets(true), 4000);
    setTimeout(() => fetchAssets(true), 8000);
  };

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  // Calculate Storage Stats
  const totalSize = assets.reduce((acc: number, asset: any) => acc + (asset.fileSize || 0), 0);
  const storageLimit = 5 * 1024 * 1024 * 1024; // 5GB
  const storagePercent = Math.min((totalSize / storageLimit) * 100, 100);

  const renderContent = () => {
    switch (activeTab) {
      case "all":
        return loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%' }}></div>
          </div>
        ) : (
          <AssetGrid assets={assets} />
        );

      case "storage":
        return (
          <div className="tab-pane">
            <h2>Cloud Storage</h2>
            <div className="stats-card">
              <div className="stats-info">
                <HardDrive size={40} className="stats-icon" />
                <div>
                  <h3>{(totalSize / (1024 * 1024)).toFixed(2)} MB Used</h3>
                  <p>of 5.00 GB total storage</p>
                </div>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${storagePercent}%` }}></div>
              </div>
              <p className="stats-subtext">{assets.length} Assets managed in S3</p>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="tab-pane">
            <h2>Security Vault</h2>
            <div className="security-grid">
              <div className="security-item">
                <ShieldCheck className="sec-icon" />
                <h4>Encryption at Rest</h4>
                <p>All files are encrypted using AES-256 via AWS KMS.</p>
              </div>
              <div className="security-item">
                <Shield className="sec-icon" />
                <h4>Secure Transmissions</h4>
                <p>Signed URLs expire after 1 hour for maximum protection.</p>
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="tab-pane">
            <h2>User Profile</h2>
            <div className="profile-card">
              <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || "U"}</div>
              <div className="user-details">
                <p><strong>User ID:</strong> <code className="id-code">{user?.userId}</code></p>
                <p><strong>Account Status:</strong> <span className="status-badge">Authenticated</span></p>
              </div>
            </div>
          </div>
        );

      case "guide":
        return (
          <div className="tab-pane">
            <div className="guide-header">
              <h2>How Lumina Works</h2>
              <p>Experience the synergy of AI and Serverless Infrastructure.</p>
            </div>

            <div className="guide-grid">
              <div className="guide-card">
                <div className="guide-icon-wrapper ai">
                  <Cpu size={24} />
                </div>
                <h3>AI Vision Analysis</h3>
                <p>The moment you upload, AWS Rekognition deep-scans your pixels to detect objects, scenes, and text, automatically generating smart tags.</p>
              </div>

              <div className="guide-card">
                <div className="guide-icon-wrapper secure">
                  <Lock size={24} />
                </div>
                <h3>Multi-Layer Security</h3>
                <p>Your assets are stored in private S3 buckets, protected by AWS KMS encryption, and only accessible via time-limited signed URLs.</p>
              </div>

              <div className="guide-card">
                <div className="guide-icon-wrapper scale">
                  <Zap size={24} />
                </div>
                <h3>Serverless Velocity</h3>
                <p>Built on a purely serverless stack (Lambda & DynamoDB), Lumina scales instantly to your needs with zero latency and high availability.</p>
              </div>
            </div>

            <div className="workflow-section">
              <h3>The Core Workflow</h3>
              <div className="workflow-steps">
                <div className="step">
                  <div className="step-number">01</div>
                  <h4>Asset Ingestion</h4>
                  <p>Upload files directly to S3. Our system automatically triggers a background "Lumina-Process" worker.</p>
                </div>
                <div className="step">
                  <div className="step-number">02</div>
                  <h4>AI Identification</h4>
                  <p>The worker uses Computer Vision to understand the naming, content, and context of your file.</p>
                </div>
                <div className="step">
                  <div className="step-number">03</div>
                  <h4>Smart Discovery</h4>
                  <p>Assets appear in your dashboard instantly with AI tags, allowing for advanced filtering and search.</p>
                </div>
                <div className="step">
                  <div className="step-number">04</div>
                  <h4>Secure Distribution</h4>
                  <p>Generate secure, 24-hour expiring share links to distribute your assets safely externally.</p>
                </div>
              </div>
            </div>

            <div className="tech-stack-section">
              <h3>Our Technology Stack</h3>
              <div className="tech-pills">
                <span className="tech-pill">Next.js 15</span>
                <span className="tech-pill">AWS Amplify</span>
                <span className="tech-pill">AWS Lambda</span>
                <span className="tech-pill">Amazon S3</span>
                <span className="tech-pill">Amazon DynamoDB</span>
                <span className="tech-pill">AWS Rekognition</span>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="tab-pane"><h2>Section coming soon...</h2></div>;
    }
  }

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>LUMINA</div>

        <nav className="nav-group">
          <div className={`nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setIsSidebarOpen(false); }}>
            <LayoutGrid size={20} />
            All Assets
          </div>
          <div className={`nav-item ${activeTab === 'storage' ? 'active' : ''}`} onClick={() => { setActiveTab('storage'); setIsSidebarOpen(false); }}>
            <Cloud size={20} />
            Cloud Storage
          </div>
          <div className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => { setActiveTab('security'); setIsSidebarOpen(false); }}>
            <ShieldCheck size={20} />
            Security
          </div>
          <div className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => { setActiveTab('guide'); setIsSidebarOpen(false); }}>
            <Zap size={20} />
            How it Works
          </div>
        </nav>

        <div className="nav-group" style={{ marginTop: 'auto' }}>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}>
            <User size={20} />
            Profile
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}>
            <Settings size={20} />
            Settings
          </div>
          <div className="nav-item" onClick={signOut} style={{ color: '#ef4444' }}>
            <LogOut size={20} />
            Sign Out
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <main>
        <header className="dashboard-header">
          <div className="header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1>{activeTab === 'all' ? 'Digital Assets' : activeTab === 'guide' ? 'System Guide' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              {isRefreshing && (
                <div className="refresh-indicator">
                  <RefreshCcw size={14} className="spinning" />
                  Syncing AI...
                </div>
              )}
            </div>
            <p>Welcome back, <strong>{user?.username}</strong></p>
          </div>

          <UploadButton
            userId={user?.userId || user?.username || "guest"}
            onUploadComplete={handleRefresh}
          />
        </header>

        <div className="scroll-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

const authComponents = {
  Header() {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div className="logo" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>LUMINA</div>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Secure AI-Powered Digital Asset Management</p>
      </div>
    );
  },
  Footer() {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--card-border)' }}>
        <p style={{ color: '#444', fontSize: '0.75rem' }}>&copy; 2026 Lumina AI. All rights reserved.</p>
      </div>
    );
  }
};

export default function Home() {
  return (
    <Authenticator components={authComponents} loginMechanisms={['email']}>
      {({ signOut, user }) => (
        <DashboardContent user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}
