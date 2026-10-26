'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DocumentEditor from '@/components/DocumentEditor';
import { useUser } from '@/context/UserContext';
import { DocumentItem } from '@/types';
import { ArrowLeft, AlertCircle } from 'lucide-react';


interface PageProps {
  params: Promise<{ id: string }>;
}

function DocumentPageContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { currentUser, fetchWithAuth } = useUser();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDoc() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchWithAuth(`/api/documents/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to open document');
        }

        if (isMounted) {
          setDocument(data.document);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Could not load document');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDoc();

    return () => {
      isMounted = false;
    };
  }, [id, currentUser.id]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'var(--bg-app)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--primary)',
          animation: 'pulseGlow 1s infinite linear',
        }} />
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Opening document...</span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        padding: '24px',
      }}>
        <div style={{
          maxWidth: '440px',
          width: '100%',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}>
            <AlertCircle size={24} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Access Restricted or Not Found
          </h2>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
            {error || 'You do not have permission to view this document.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link href="/" className="btn btn-primary">
              <ArrowLeft size={16} />
              Return to Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <DocumentEditor key={`${document.id}-${currentUser.id}`} initialDocument={document} />;
}

export default function DocumentPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-muted)',
          fontSize: '14px',
        }}>
          Loading document...
        </div>
      }
    >
      <DocumentPageContent {...props} />
    </Suspense>
  );
}
