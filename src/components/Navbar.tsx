'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { FileText, Users, ChevronDown, Check, RotateCcw, Share2, Sparkles } from 'lucide-react';

interface NavbarProps {
  documentTitle?: string;
  onTitleChange?: (newTitle: string) => void;
  saveStatus?: 'saved' | 'saving' | 'error' | 'unsaved';
  onShareClick?: () => void;
  canEdit?: boolean;
  sharesCount?: number;
}

export default function Navbar({
  documentTitle,
  onTitleChange,
  saveStatus,
  onShareClick,
  canEdit = true,
  sharesCount = 0,
}: NavbarProps) {
  const { currentUser, users, switchUser, fetchWithAuth } = useUser();
  const { showToast } = useToast();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle || '');

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (onTitleChange && tempTitle.trim() && tempTitle !== documentTitle) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(documentTitle || '');
    }
  };

  const handleResetData = async () => {
    if (confirm('Reset workspace to initial demo seed data? Any new docs created will be reset.')) {
      try {
        setIsResetting(true);
        const res = await fetchWithAuth('/api/seed', { method: 'POST' });
        if (res.ok) {
          showToast('Workspace reset to seed data successfully', 'success');
          window.location.href = '/';
        }
      } catch (err) {
        showToast('Failed to reset workspace', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="app-navbar" style={{
      height: 'var(--header-height)',
      background: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'relative',
      zIndex: 60,
    }}>
      {/* Left: Brand or Document Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
          }}>
            <FileText size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Ajaia Docs
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)' }}>
                BETA
              </span>
            </span>
          </div>
        </Link>

        {documentTitle !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
            {isEditingTitle && canEdit ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTempTitle(documentTitle);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  border: '1px solid var(--border-focus)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  minWidth: '220px',
                }}
              />
            ) : (
              <div
                onClick={() => canEdit && setIsEditingTitle(true)}
                title={canEdit ? 'Click to rename document' : 'View only'}
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: canEdit ? 'pointer' : 'default',
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background-color 0.15s',
                }}
              >
                {documentTitle || 'Untitled document'}
              </div>
            )}

            {/* Save Status Indicator */}
            {saveStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                {saveStatus === 'saving' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulseGlow 1s infinite' }} />
                    Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                    <Check size={14} />
                    Saved
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span style={{ color: 'var(--warning)' }}>Unsaved changes</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions & User Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onShareClick && (
          <button
            onClick={onShareClick}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            <Share2 size={15} />
            Share
            {sharesCount > 0 && (
              <span style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                marginLeft: '2px',
              }}>
                {sharesCount}
              </span>
            )}
          </button>
        )}

        {/* Reset Seed Demo Data */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          title="Reset demo data to initial seed state"
          className="btn btn-ghost"
          style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px 10px' }}
        >
          <RotateCcw size={14} />
          Reset Demo
        </button>

        {/* User Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
              transition: 'background-color 0.15s',
            }}
          >
            <div
              className="avatar-badge"
              style={{
                width: '28px',
                height: '28px',
                background: currentUser.color || '#4f46e5',
              }}
            >
              {currentUser.avatar}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                {currentUser.role}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {userDropdownOpen && (
            <>
              <div
                onClick={() => setUserDropdownOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 70 }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '260px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px',
                  zIndex: 80,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Switch Active User (Demo)
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Test document permissions instantly across accounts
                  </p>
                </div>

                {users.map((user) => {
                  const isSelected = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setUserDropdownOpen(false);
                        showToast(`Switched active user to ${user.name}`, 'info');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--primary-light)' : 'transparent',
                        transition: 'background-color 0.15s',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          className="avatar-badge"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: user.color,
                          }}
                        >
                          {user.avatar}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {user.role} ({user.email})
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={16} style={{ color: 'var(--primary)' }} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
