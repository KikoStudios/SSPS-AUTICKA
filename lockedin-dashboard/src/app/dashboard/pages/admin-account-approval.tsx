'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

interface PendingAccount {
  _id: Id<'users'>;
  username: string;
  createdAt: number;
  isApproved: boolean;
}

export default function AccountApprovalPage() {
  const pendingAccounts = useQuery(api.context.getPendingAccounts);
  const approveAccount = useMutation(api.context.approveAccount);
  const rejectAccount = useMutation(api.context.rejectAccount);
  
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleApprove = async (userId: Id<'users'>, username: string) => {
    setProcessing(userId);
    setMessage(null);
    
    try {
      await approveAccount({ userId });
      setMessage({ type: 'success', text: `✅ Uživatel ${username} byl schválen!` });
    } catch (error) {
      console.error('Error approving account:', error);
      setMessage({ type: 'error', text: `❌ Chyba při schvalování účtu ${username}` });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: Id<'users'>, username: string) => {
    if (!confirm(`Opravdu chcete odmítnout účet "${username}"? Tato akce je nevratná.`)) {
      return;
    }

    setProcessing(userId);
    setMessage(null);
    
    try {
      await rejectAccount({ userId });
      setMessage({ type: 'success', text: `✅ Uživatel ${username} byl odmítnut a smazán.` });
    } catch (error) {
      console.error('Error rejecting account:', error);
      setMessage({ type: 'error', text: `❌ Chyba při odmítání účtu ${username}` });
    } finally {
      setProcessing(null);
    }
  };

  // Auto-hide success messages after 5 seconds
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (pendingAccounts === undefined) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Načítání...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px', fontWeight: 'bold' }}>
        Schvalování účtů
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Spravujte žádosti o vytvoření nových účtů
      </p>

      {message && (
        <div
          style={{
            padding: '15px 20px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {pendingAccounts.length === 0 ? (
        <div
          style={{
            padding: '60px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #dee2e6',
          }}
        >
          <p style={{ fontSize: '18px', color: '#6c757d' }}>
            ✅ Žádné čekající žádosti
          </p>
          <p style={{ fontSize: '14px', color: '#adb5bd', marginTop: '10px' }}>
            Nové účty se objeví zde po registraci
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {pendingAccounts.map((account) => (
            <div
              key={account._id}
              style={{
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {account.username}
                </h3>
                <p style={{ fontSize: '14px', color: '#6c757d' }}>
                  Vytvořeno: {new Date(account.createdAt).toLocaleString('cs-CZ')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleApprove(account._id, account.username)}
                  disabled={processing === account._id}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: processing === account._id ? '#ccc' : '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: processing === account._id ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (processing !== account._id) {
                      e.currentTarget.style.backgroundColor = '#218838';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (processing !== account._id) {
                      e.currentTarget.style.backgroundColor = '#28a745';
                    }
                  }}
                >
                  {processing === account._id ? '⏳ Zpracování...' : '✓ Schválit'}
                </button>

                <button
                  onClick={() => handleReject(account._id, account.username)}
                  disabled={processing === account._id}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: processing === account._id ? '#ccc' : '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: processing === account._id ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (processing !== account._id) {
                      e.currentTarget.style.backgroundColor = '#c82333';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (processing !== account._id) {
                      e.currentTarget.style.backgroundColor = '#dc3545';
                    }
                  }}
                >
                  {processing === account._id ? '⏳ Zpracování...' : '✗ Odmítnout'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
