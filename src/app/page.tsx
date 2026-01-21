"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import UploadButton from "@/components/UploadButton";
import AssetGrid from "@/components/AssetGrid";
import { useEffect, useState } from "react";
import { getAssets } from "./actions";
import { LayoutGrid, Cloud, ShieldCheck, LogOut, Settings, User, Menu, X, RefreshCcw } from "lucide-react";

function DashboardContent({ user, signOut }: { user: any; signOut: any }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchAssets = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      const userId = user?.userId || user?.username;
      console.log("Fetching assets for Lumina User:", userId);

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
    console.log("Starting background sync...");
    // 1. Initial check (1.5s)
    setTimeout(() => fetchAssets(true), 1500);
    // 2. Poll when AI tagging is likely done (4s)
    setTimeout(() => fetchAssets(true), 4000);
    // 3. Final safety check (8s)
    setTimeout(() => fetchAssets(true), 8000);
  };

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>LUMINA</div>

        <nav className="nav-group">
          <div className="nav-item active" onClick={() => setIsSidebarOpen(false)}>
            <LayoutGrid size={20} />
            All Assets
          </div>
          <div className="nav-item" onClick={() => setIsSidebarOpen(false)}>
            <Cloud size={20} />
            Cloud Storage
          </div>
          <div className="nav-item" onClick={() => setIsSidebarOpen(false)}>
            <ShieldCheck size={20} />
            Security
          </div>
        </nav>

        <div className="nav-group" style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => setIsSidebarOpen(false)}>
            <User size={20} />
            Profile
          </div>
          <div className="nav-item" onClick={() => setIsSidebarOpen(false)}>
            <Settings size={20} />
            Settings
          </div>
          <div className="nav-item" onClick={signOut} style={{ color: '#ef4444' }}>
            <LogOut size={20} />
            Sign Out
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Dashboard */}
      <main>
        <header className="dashboard-header">
          <div className="header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1>Digital Assets</h1>
              {isRefreshing && (
                <div className="refresh-indicator">
                  <RefreshCcw size={14} className="spinning" />
                  Updating AI Tags...
                </div>
              )}
            </div>
            <p>Welcome back, <strong>{user?.username}</strong></p>
          </div>

          <UploadButton
            userId={user?.userId || user?.username || "guest"}
            onUploadComplete={() => {
              console.log("Upload complete, starting auto-refresh...");
              handleRefresh();
            }}
          />
        </header>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%' }}></div>
          </div>
        ) : (
          <AssetGrid assets={assets} />
        )}
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
