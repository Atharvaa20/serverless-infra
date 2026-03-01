"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthenticated: (user: any) => void;
    message?: string;
}

function AuthenticatedRedirect({ user, onAuthenticated }: { user: any; onAuthenticated: (user: any) => void }) {
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (user && !hasRedirected.current) {
            hasRedirected.current = true;
            onAuthenticated(user);
        }
    }, [user, onAuthenticated]);

    return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Signing you in...</div>;
}

export default function AuthModal({ isOpen, onClose, onAuthenticated, message }: AuthModalProps) {
    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {message && (
                    <div className="auth-modal-message">
                        <p>{message}</p>
                    </div>
                )}

                <Authenticator
                    loginMechanisms={['email']}
                    components={{
                        Header() {
                            return (
                                <div style={{ padding: '2rem 1rem 1rem', textAlign: 'center' }}>
                                    <div className="logo" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>LUMINA</div>
                                    <p style={{ color: '#666', fontSize: '0.85rem' }}>Sign in to unlock all features</p>
                                </div>
                            );
                        },
                        Footer() {
                            return (
                                <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--card-border)' }}>
                                    <p style={{ color: '#444', fontSize: '0.7rem' }}>&copy; 2026 Lumina AI. All rights reserved.</p>
                                </div>
                            );
                        }
                    }}
                >
                    {({ user }) => (
                        <AuthenticatedRedirect user={user} onAuthenticated={onAuthenticated} />
                    )}
                </Authenticator>
            </div>
        </div>
    );
}
