'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Card, CardBody, Divider, Spacer, Button, ButtonGroup, Spinner } from '@heroui/react';
import { SuccessButton, DangerButton, AlertBox } from '@/components/heroui-components';

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
      <div className="flex justify-center items-center p-10">
        <Spinner label="Načítání..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Schvalování účtů</h1>
        <p className="text-gray-500">Spravujte žádosti o vytvoření nových účtů</p>
      </div>

      {message && (
        <>
          <AlertBox type={message.type} message={message.text.replace('✅ ', '').replace('❌ ', '')} />
          <Spacer y={2} />
        </>
      )}

      {pendingAccounts.length === 0 ? (
        <Card className="bg-gray-50">
          <CardBody className="text-center py-12">
            <p className="text-lg font-semibold">✅ Žádné čekající žádosti</p>
            <p className="text-gray-400 mt-2">Nové účty se objeví zde po registraci</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingAccounts.map((account) => (
            <Card key={account._id} className="shadow-sm">
              <CardBody className="flex flex-row justify-between items-center py-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{account.username}</h3>
                  <p className="text-sm text-gray-500">
                    Vytvořeno: {new Date(account.createdAt).toLocaleString('cs-CZ')}
                  </p>
                </div>

                <ButtonGroup className="gap-2">
                  <SuccessButton
                    onClick={() => handleApprove(account._id, account.username)}
                    disabled={processing === account._id}
                    size="sm"
                  >
                    {processing === account._id ? (
                      <>
                        <Spinner size="sm" color="current" /> Zpracování...
                      </>
                    ) : (
                      '✓ Schválit'
                    )}
                  </SuccessButton>

                  <DangerButton
                    onClick={() => handleReject(account._id, account.username)}
                    disabled={processing === account._id}
                    size="sm"
                  >
                    {processing === account._id ? (
                      <>
                        <Spinner size="sm" color="current" /> Zpracování...
                      </>
                    ) : (
                      '✗ Odmítnout'
                    )}
                  </DangerButton>
                </ButtonGroup>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
