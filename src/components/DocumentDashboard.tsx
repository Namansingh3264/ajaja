'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocumentItem } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import Navbar from './Navbar';
import FileUploadModal from './FileUploadModal';
import ShareModal from './ShareModal';
import {
  Plus,
  UploadCloud,
  FileText,
  Search,
  Filter,
  Users,
  Clock,
  MoreVertical,
  Trash2,
  Share2,
  Sparkles,
  CheckCircle2,
  Lock,
  Calendar,
} from 'lucide-react';

export default function DocumentDashboard() {
  const router = useRouter();
  const { currentUser, fetchWithAuth } = useUser();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'shared'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeShareDoc, setActiveShareDoc] = useState<DocumentItem | null>(null);

  // Fetch documents for currently active user
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.all || []);
      }
    } catch (err) {
      console.error('Failed loading documents:', err);
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentUser.id]);

  // Handle document creation
  const handleCreateDocument = async (templateType?: 'spec' | 'meeting') => {
    try {
      let title = 'Untitled document';
      let content = '<p>Start writing your document here...</p>';

      if (templateType === 'spec') {
        title = 'Product Feature Specification';
        content = `<h1>Product Feature Specification</h1>
<p><strong>Status:</strong> Draft &nbsp;|&nbsp; <strong>Owner:</strong> ${currentUser.name}</p>
<h2>1. Problem Overview</h2>
<p>Describe the user problem and motivation for this feature.</p>
<h2>2. Target Audience & Use Cases</h2>
<ul>
<li>Primary Persona: Knowledge worker / team lead</li>
<li>Core Workflow: Collaborative real-time document drafting</li>
</ul>
<h2>3. Proposed Solution</h2>
<p>Explain the architecture, UX design, and expected behavior.</p>
<h2>4. Success Metrics</h2>
<ol>
<li>Weekly active editors &gt; 1,000</li>
<li>Document load time &lt; 200ms</li>
</ol>`;
      } else if (templateType === 'meeting') {
        title = 'Team Sync & Action Items';
        content = `<h1>Team Sync — ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</h1>
<p><strong>Attendees:</strong> ${currentUser.name}, Engineering & Design Team</p>
<h2>Agenda</h2>
<ul>
<li>Review sprint priorities and blockers</li>
<li>Document sharing permission model walkthrough</li>
<li>Next sprint planning</li>
</ul>
<h2>Key Decisions</h2>
<p>Align on atomic filesystem persistence and instant multi-user simulation.</p>
<h2>Action Items</h2>
<ol>
<li>Complete automated test suite — Bob</li>
<li>Finalize UI layout and typography — Charlie</li>
<li>Prepare walkthrough recording and documentation — Alice</li>
</ol>`;
      }

      const res = await fetchWithAuth('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create document');

      showToast(`Created "${data.document.title}"`, 'success');
      router.push(`/documents/${data.document.id}`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (docId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetchWithAuth(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete document');

      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      showToast(`Deleted "${title}"`, 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Helper to extract clean text snippet
  const getTextSnippet = (html: string) => {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 120 ? text.substring(0, 120) + '...' : text || 'Empty document';
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    // Tab filter
    if (activeTab === 'owned' && doc.ownerId !== currentUser.id) return false;
    if (activeTab === 'shared' && doc.ownerId === currentUser.id) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = doc.title.toLowerCase().includes(q);
      const contentMatch = doc.content.toLowerCase().includes(q);
      return titleMatch || contentMatch;
    }

    return true;
  });

  const ownedCount = documents.filter((d) => d.ownerId === currentUser.id).length;
  const sharedCount = documents.filter((d) => d.ownerId !== currentUser.id).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px 24px' }}>
        {/* Welcome Banner */}
        <section style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '32px',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div className="avatar-badge" style={{ width: '28px', height: '28px', background: currentUser.color }}>
                {currentUser.avatar}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#e0e7ff' }}>
                Welcome back, {currentUser.name}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '6px' }}>
              Collaborative Document Workspace
            </h1>
            <p style={{ fontSize: '14px', color: '#c7d2fe', maxWidth: '600px' }}>
              Create, edit, share, and import rich-text documents with real-time permissions. Use the top switcher to test Alice, Bob, and Charlie.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleCreateDocument()}
              className="btn"
              style={{ background: '#ffffff', color: '#4338ca', fontWeight: 700, padding: '10px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Plus size={18} />
              New Document
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="btn"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '10px 18px' }}
            >
              <UploadCloud size={18} />
              Import File
            </button>
          </div>
        </section>

        {/* Quick Start Templates */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
            Start a new document
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Blank */}
            <div
              onClick={() => handleCreateDocument()}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '130px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Blank Document</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Start from a clean slate</p>
              </div>
            </div>

            {/* Import File */}
            <div
              onClick={() => setIsImportModalOpen(true)}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '130px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#059669';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadCloud size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Import File</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>.docx, .md, or .txt</p>
              </div>
            </div>

            {/* Product Spec */}
            <div
              onClick={() => handleCreateDocument('spec')}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '130px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Product Spec</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>RFC & feature requirements</p>
              </div>
            </div>

            {/* Meeting Notes */}
            <div
              onClick={() => handleCreateDocument('meeting')}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '130px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#d97706';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Meeting Notes</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Agenda & action checklist</p>
              </div>
            </div>
          </div>
        </section>

        {/* Documents Section Header & Filter Tabs */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-muted)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: activeTab === 'all' ? '#ffffff' : 'transparent',
                  color: activeTab === 'all' ? 'var(--text-main)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'all' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                All Documents ({documents.length})
              </button>
              <button
                onClick={() => setActiveTab('owned')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: activeTab === 'owned' ? '#ffffff' : 'transparent',
                  color: activeTab === 'owned' ? 'var(--text-main)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'owned' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Owned by me ({ownedCount})
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: activeTab === 'shared' ? '#ffffff' : 'transparent',
                  color: activeTab === 'shared' ? 'var(--text-main)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'shared' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Shared with me ({sharedCount})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  background: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Loading workspace documents...
            </div>
          )}

          {/* Document Grid */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredDocuments.map((doc) => {
                const isDocOwner = doc.ownerId === currentUser.id;
                const userPermission = doc.userPermission || (isDocOwner ? 'owner' : 'view');

                return (
                  <div
                    key={doc.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.borderColor = 'var(--border-strong)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    {/* Top Content Area */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                        <Link href={`/documents/${doc.id}`} style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '4px' }}>
                            {doc.title}
                          </h3>
                        </Link>

                        {/* Permission Badge */}
                        {isDocOwner ? (
                          <span className="permission-badge badge-owner">Owner</span>
                        ) : userPermission === 'edit' ? (
                          <span className="permission-badge badge-edit">Can edit</span>
                        ) : (
                          <span className="permission-badge badge-view">Can view</span>
                        )}
                      </div>

                      <Link href={`/documents/${doc.id}`}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '40px' }}>
                          {getTextSnippet(doc.content)}
                        </p>
                      </Link>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div style={{
                      padding: '12px 20px',
                      background: 'var(--bg-subtle)',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Owner / Collaborator avatars */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            className="avatar-badge"
                            title={`Owner: ${doc.owner?.name}`}
                            style={{ width: '24px', height: '24px', background: doc.owner?.color || '#4f46e5' }}
                          >
                            {doc.owner?.avatar || 'OW'}
                          </div>
                          {(doc.shares || []).slice(0, 2).map((share, idx) => (
                            <div
                              key={share.id}
                              className="avatar-badge"
                              title={`Collaborator: ${share.user?.name} (${share.permission})`}
                              style={{
                                width: '24px',
                                height: '24px',
                                background: share.user?.color || '#059669',
                                marginLeft: '-8px',
                              }}
                            >
                              {share.user?.avatar || 'C'}
                            </div>
                          ))}
                        </div>

                        <span>
                          {new Date(doc.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Quick Card Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => setActiveShareDoc(doc)}
                          className="btn-ghost"
                          title="Share document"
                          style={{ padding: '6px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Share2 size={15} />
                        </button>

                        {isDocOwner && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            className="btn-ghost"
                            title="Delete document"
                            style={{ padding: '6px', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredDocuments.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-strong)',
              marginTop: '10px',
            }}>
              <FileText size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                No documents found
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                {searchQuery
                  ? `No documents matching "${searchQuery}"`
                  : activeTab === 'shared'
                  ? 'No documents shared with you yet. Try switching to another user!'
                  : 'Get started by creating a new document or importing a file.'}
              </p>
              <button
                onClick={() => handleCreateDocument()}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Create Document
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Global Modals */}
      <FileUploadModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        mode="create"
      />

      {activeShareDoc && (
        <ShareModal
          document={activeShareDoc}
          isOpen={Boolean(activeShareDoc)}
          onClose={() => setActiveShareDoc(null)}
          onDocumentUpdated={(updated) => {
            setActiveShareDoc(updated);
            setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          }}
        />
      )}
    </div>
  );
}
