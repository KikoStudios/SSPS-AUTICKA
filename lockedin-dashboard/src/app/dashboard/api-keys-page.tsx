import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Divider,
  Textarea,
  Checkbox,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import { FaKey, FaTrash, FaPlus, FaCopy, FaCheck, FaLock, FaEdit, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

interface PageProps {
  username?: string;
  userData?: Record<string, unknown>;
}

interface ApiKey {
  _id: Id<'apiKeys'>;
  name: string;
  description?: string;
  scopes: string[];
  allowedPlugins?: string[];
  dataScopes?: string[];
  allowedEndpoints?: string[];
  blockedEndpoints?: string[];
  rateLimit?: number;
  isActive: boolean;
  lastUsed?: number;
  createdAt: number;
}

const AVAILABLE_SCOPES = [
  { id: 'plugin:read', label: 'Read Plugin Data', icon: '📖' },
  { id: 'plugin:write', label: 'Write Plugin Data', icon: '✍️' },
  { id: 'data:read', label: 'Read All Data', icon: '📖' },
  { id: 'data:write', label: 'Write All Data', icon: '✍️' },
  { id: 'api:call', label: 'Call Plugin APIs', icon: '🔗' },
  { id: 'files:read', label: 'Read Files', icon: '📁' },
  { id: 'files:upload', label: 'Upload Files', icon: '📤' },
];

export const ApiKeysPage: React.FC<PageProps> = ({ username }) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [viewKey, setViewKey] = useState<ApiKey | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmConfig, setConfirmConfig] = useState<{message: string; onConfirm: () => void} | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPluginTab, setSelectedPluginTab] = useState<string>('');
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scopes: [] as string[],
    allowedEndpoints: [] as string[],
    blockedEndpoints: [] as string[],
    rateLimit: 0,
  });

  // Queries and mutations
  const keysData = useQuery(api.apiKeys.listKeys);
  const pluginsData = useQuery(api.context.getAllPlugins);
  const generateKey = useMutation(api.apiKeys.generateKey);
  const updateKey = useMutation(api.apiKeys.updateKey);
  const revokeKey = useMutation(api.apiKeys.revokeKey);

  useEffect(() => {
    if (keysData) {
      setKeys(keysData);
    }
  }, [keysData]);

  useEffect(() => {
    if (isOpen && pluginsData && pluginsData.length > 0 && !selectedPluginTab) {
      setSelectedPluginTab(pluginsData[0].name);
    }
  }, [isOpen, pluginsData, selectedPluginTab]);

  // Helper functions for modals
  const showAlert = (message: string) => {
    setAlertMessage(message);
    onAlertOpen();
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmConfig({ message, onConfirm });
    onConfirmOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      scopes: [],
      allowedEndpoints: [],
      blockedEndpoints: [],
      rateLimit: 0,
    });
    setSelectedKey(null);
    setIsEditMode(false);
    setSelectedPluginTab('');
    setStep(1);
  };

  const handleCreateKey = async () => {
    if (!formData.name.trim()) {
      showAlert('Please enter a key name');
      return;
    }

    // Validate: Must have at least one endpoint enabled
    if (formData.allowedEndpoints.length === 0) {
      showAlert('Please enable at least one endpoint');
      return;
    }

    // Auto-grant all scopes since we're controlling at endpoint level
    const allScopes = AVAILABLE_SCOPES.map(s => s.id);

    try {
      const key = await generateKey({
        name: formData.name,
        description: formData.description,
        scopes: allScopes,
        allowedPlugins: [...new Set(formData.allowedEndpoints.map(e => e.split('/')[0]))],
        allowedEndpoints: formData.allowedEndpoints,
        blockedEndpoints: formData.blockedEndpoints.length > 0 ? formData.blockedEndpoints : undefined,
        rateLimit: formData.rateLimit || undefined,
      });

      setNewKey(key);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Failed to create key:', err);
      showAlert('Failed to create key');
    }
  };

  const handleUpdateKey = async () => {
    if (!selectedKey) return;

    // Auto-grant all scopes since we're controlling at endpoint level
    const allScopes = AVAILABLE_SCOPES.map(s => s.id);

    try {
      await updateKey({
        id: selectedKey._id,
        name: formData.name,
        description: formData.description,
        scopes: allScopes,
        allowedPlugins: formData.allowedEndpoints.length > 0 ? [...new Set(formData.allowedEndpoints.map(e => e.split('/')[0]))] : undefined,
        allowedEndpoints: formData.allowedEndpoints.length > 0 ? formData.allowedEndpoints : undefined,
        blockedEndpoints: formData.blockedEndpoints.length > 0 ? formData.blockedEndpoints : undefined,
        rateLimit: formData.rateLimit || undefined,
      });

      showAlert('Key updated successfully');
      resetForm();
      onClose();
    } catch (err) {
      console.error('Failed to update key:', err);
      showAlert('Failed to update key');
    }
  };

  const handleEditKey = (key: ApiKey) => {
    setSelectedKey(key);
    setFormData({
      name: key.name,
      description: key.description || '',
      scopes: key.scopes,
      allowedEndpoints: key.allowedEndpoints || [],
      blockedEndpoints: key.blockedEndpoints || [],
      rateLimit: key.rateLimit || 0,
    });
    setIsEditMode(true);
    onOpen();
  };

  const handleRevoke = async (id: Id<'apiKeys'>) => {
    showConfirm('Are you sure? This key will stop working immediately.', async () => {
      try {
        await revokeKey({ id });
        showAlert('Key revoked successfully');
      } catch (err) {
        console.error('Failed to revoke key:', err);
      }
    });
  };

  const handleViewKey = (key: ApiKey) => {
    setViewKey(key);
    setShowKeyValue(false);
    onViewOpen();
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <FaKey className="text-3xl text-primary" />
              <h1 className="text-3xl font-bold text-foreground">API Keys Management</h1>
            </div>
            <p className="text-default-600">Create and manage API keys for external apps, IoT devices, and integrations</p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<FaPlus />}
            onClick={() => {
              resetForm();
              setIsEditMode(false);
              onOpen();
            }}
            className="font-bold"
          >
            Create New Key
          </Button>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">TOTAL KEYS</span>
                <FaKey className="text-blue-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{keys.length}</div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">ACTIVE KEYS</span>
                <FaCheck className="text-green-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{keys.filter(k => k.isActive).length}</div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-red-600 dark:text-red-400 text-sm font-bold">REVOKED</span>
                <FaTimes className="text-red-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{keys.filter(k => !k.isActive).length}</div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">USAGE TODAY</span>
                <FaLock className="text-yellow-500 text-xl" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {keys.filter(k => k.lastUsed && new Date(k.lastUsed).toDateString() === new Date().toDateString()).length}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* New Key Display */}
      {newKey && (
        <Card className="bg-success-50 border border-success-200">
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2 text-success">
              <FaCheck /> <span className="font-bold">New Key Generated!</span>
            </div>
            <p className="text-sm text-default-700">
              Save this key now. You won't be able to see it again after you close this.
            </p>
            <div className="flex gap-2 bg-default-100 p-3 rounded-lg font-mono text-sm text-foreground break-all border border-default-200">
              <span className="flex-1">{newKey}</span>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={copyToClipboard}
              >
                {copied ? <FaCheck className="text-success" /> : <FaCopy />}
              </Button>
            </div>
            <Button
              color="success"
              onClick={() => setNewKey(null)}
              fullWidth
            >
              Done (I have saved it)
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Active Keys Table */}
      <Card className="border border-default-200">
        <CardHeader className="flex justify-between items-center border-b border-default-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Your API Keys</h2>
            <p className="text-xs text-default-500 mt-1">Manage your API keys and their permissions</p>
          </div>
        </CardHeader>
        <CardBody>
          {keys.length === 0 ? (
            <div className="text-center py-12">
              <FaKey className="mx-auto mb-4 text-5xl opacity-20 text-default-300" />
              <p className="text-default-700 font-bold text-lg mb-2">No API keys yet</p>
              <p className="text-default-500 mb-4">Create your first API key to integrate with external apps and IoT devices</p>
              <Button
                color="primary"
                startContent={<FaPlus />}
                onClick={() => {
                  resetForm();
                  setIsEditMode(false);
                  onOpen();
                }}
              >
                Create Your First Key
              </Button>
            </div>
          ) : (
            <Table
              aria-label="API Keys table"
              removeWrapper
              classNames={{
                base: "max-h-full",
                th: "bg-default-100 text-default-700 font-semibold",
                td: "py-4"
              }}
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>SCOPES</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ENDPOINTS</TableColumn>
                <TableColumn>LAST USED</TableColumn>
                <TableColumn className="text-right">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {keys.map(key => (
                  <TableRow key={key._id} className="hover:bg-default-100">
                    <TableCell>
                      <div>
                        <p className="font-bold text-foreground">{key.name}</p>
                        {key.description && <p className="text-xs text-default-500">{key.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 2).map((scope, idx) => (
                          <Chip key={`scope-${idx}`} size="sm" variant="flat" color="primary">
                            {scope}
                          </Chip>
                        ))}
                        {key.scopes.length > 2 && (
                          <Chip size="sm" variant="flat" color="primary">
                            +{key.scopes.length - 2}
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={key.isActive ? 'success' : 'danger'}
                        variant="flat"
                        size="sm"
                      >
                        {key.isActive ? 'ACTIVE' : 'REVOKED'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {key.allowedEndpoints && key.allowedEndpoints.length > 0 && (
                          <div className="text-success font-semibold">{key.allowedEndpoints.length} allowed</div>
                        )}
                        {key.blockedEndpoints && key.blockedEndpoints.length > 0 && (
                          <div className="text-danger">{key.blockedEndpoints.length} blocked</div>
                        )}
                        {(!key.allowedEndpoints || key.allowedEndpoints.length === 0) &&
                         (!key.blockedEndpoints || key.blockedEndpoints.length === 0) && (
                          <div className="text-default-500">All access</div>
                        )}
                        {key.rateLimit && (
                          <div className="text-warning text-xs">{key.rateLimit}/min limit</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-default-500">
                      {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {key.isActive && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            onClick={() => handleViewKey(key)}
                            title="View key details"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="default"
                            onClick={() => handleEditKey(key)}
                            title="Edit key"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onClick={() => handleRevoke(key._id)}
                            title="Revoke key"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      )}
                      {!key.isActive && (
                        <span className="text-danger text-sm">Revoked</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Modal with 3-Step Wizard */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => { onClose(); resetForm(); }} 
        size="4xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          {/* Step Indicator */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center mb-4">
              {[1, 2, 3].map((stepNum, idx) => (
                <React.Fragment key={stepNum}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors flex-shrink-0 ${
                    stepNum === step 
                      ? 'bg-blue-500 text-white' 
                      : stepNum < step 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {stepNum < step ? <FaCheck /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-1 mx-2 transition-colors ${
                      stepNum < step ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <ModalHeader className="p-0 flex items-center gap-2">
              <FaLock className="text-blue-400" />
              {isEditMode ? 'Edit API Key' : 'Create New API Key'} - Step {step} of 3
            </ModalHeader>
          </div>

          <Divider />

          {/* Step 1: Key Details */}
          {step === 1 && (
            <ModalBody className="space-y-4 py-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FaKey className="text-sm" /> Basic Information
                </h3>
                <Input
                  label="Key Name *"
                  placeholder="e.g. IoT Gate Controller, Main Parking System"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  description="Give this key a descriptive name"
                />
                <Textarea
                  label="Description"
                  placeholder="What will this key be used for? Where is it deployed?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  description="Optional: Add notes about this key's purpose"
                />
                <Input
                  label="Rate Limit (requests/minute)"
                  type="number"
                  placeholder="0 for unlimited"
                  value={String(formData.rateLimit)}
                  onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) || 0 })}
                  description="Limit how many requests this key can make per minute"
                />
              </div>
            </ModalBody>
          )}

          {/* Step 2: Plugin & Endpoint Access */}
          {step === 2 && (
            <ModalBody className="space-y-4 py-6">
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Plugin & Endpoint Access</h3>
                <p className="text-sm text-gray-400">Select which endpoints this key can access for each plugin</p>
                {pluginsData && pluginsData.length > 0 ? (
                  <div className="flex gap-3 border border-default-200 rounded-lg overflow-hidden" style={{ height: '380px', backgroundColor: 'var(--bg-card)' }}>
                    {/* Plugin List - Left Sidebar */}
                    <div className="w-56 border-r border-default-200 overflow-y-auto bg-default-50">
                      {pluginsData.map((plugin: any) => {
                        const pluginEndpoints = plugin?.apiEndpoints || [];
                        const enabledCount = pluginEndpoints.filter((ep: string) => 
                          formData.allowedEndpoints.includes(`${plugin.name}/${ep}`)
                        ).length;
                        const allEnabled = enabledCount === pluginEndpoints.length && pluginEndpoints.length > 0;
                        const someEnabled = enabledCount > 0 && enabledCount < pluginEndpoints.length;

                        return (
                          <div
                            key={plugin._id}
                            className={`border-b border-default-200 transition-colors ${
                              selectedPluginTab === plugin.name ? 'bg-default-100' : 'hover:bg-default-100'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedPluginTab(plugin.name)}
                              className="w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between gap-2"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">{plugin.name}</p>
                                <p className="text-xs text-default-500">{pluginEndpoints.length} endpoints</p>
                              </div>
                              <Checkbox
                                isSelected={allEnabled}
                                isIndeterminate={someEnabled}
                                onValueChange={(checked) => {
                                  const pluginEndpoints = plugin?.apiEndpoints || [];
                                  if (checked || someEnabled) {
                                    // Enable all endpoints for this plugin
                                    const newAllowed = [...formData.allowedEndpoints];
                                    pluginEndpoints.forEach((ep: string) => {
                                      const key = `${plugin.name}/${ep}`;
                                      if (!newAllowed.includes(key)) {
                                        newAllowed.push(key);
                                      }
                                    });
                                    setFormData({
                                      ...formData,
                                      allowedEndpoints: newAllowed
                                    });
                                  } else {
                                    // Disable all endpoints for this plugin
                                    const pluginPrefix = `${plugin.name}/`;
                                    setFormData({
                                      ...formData,
                                      allowedEndpoints: formData.allowedEndpoints.filter(e => !e.startsWith(pluginPrefix))
                                    });
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                size="sm"
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Endpoints - Right Panel */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {selectedPluginTab ? (
                        <>
                          {(() => {
                            const plugin = pluginsData.find((p: any) => p.name === selectedPluginTab);
                            const endpoints = plugin?.apiEndpoints || [];

                            if (endpoints.length === 0) {
                              return (
                                <div className="text-center py-12 text-default-500">
                                  <p>No API endpoints for this plugin</p>
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-bold text-foreground">{selectedPluginTab}</h4>
                                  <p className="text-xs text-default-500 mt-1">
                                    {endpoints.filter((ep: string) => formData.allowedEndpoints.includes(`${selectedPluginTab}/${ep}`)).length} of {endpoints.length} enabled
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {endpoints.map((endpoint: string, idx: number) => {
                                    const endpointKey = `${selectedPluginTab}/${endpoint}`;
                                    const isEnabled = formData.allowedEndpoints.includes(endpointKey);
                                    
                                    return (
                                      <div 
                                        key={idx} 
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                          isEnabled 
                                            ? 'bg-success-50 border-success-200' 
                                            : 'bg-default-100 border-default-200 hover:border-default-300'
                                        }`}
                                      >
                                        <div className="flex-1">
                                          <div className="font-semibold text-sm text-foreground">{endpoint}</div>
                                          <div className="text-xs text-default-500 mt-1 font-mono">/api/{selectedPluginTab}/{endpoint}</div>
                                        </div>
                                        <Checkbox
                                          isSelected={isEnabled}
                                          onValueChange={(checked) => {
                                            if (checked) {
                                              setFormData({
                                                ...formData,
                                                allowedEndpoints: [...formData.allowedEndpoints, endpointKey]
                                              });
                                            } else {
                                              setFormData({
                                                ...formData,
                                                allowedEndpoints: formData.allowedEndpoints.filter(e => e !== endpointKey)
                                              });
                                            }
                                          }}
                                          size="lg"
                                          color="success"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="text-center py-12 text-default-500">
                          <p>Select a plugin to view endpoints</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-default-500">
                    <p>No plugins available</p>
                  </div>
                )}
              </div>
            </ModalBody>
          )}

          {/* Step 3: Summary & Confirmation */}
          {step === 3 && (
            <ModalBody className="space-y-6 py-6">
              <div>
                <h3 className="font-bold text-lg mb-4">Configuration Summary</h3>
                <div className="space-y-4">
                  {/* Key Details Summary */}
                  <Card className="bg-default-100 border border-default-200">
                    <CardBody className="space-y-2">
                      <div className="font-bold text-primary mb-2">Key Details</div>
                      <div className="flex justify-between">
                        <span className="text-default-600">Name:</span>
                        <span className="text-foreground font-mono font-bold">{formData.name || '—'}</span>
                      </div>
                      {formData.description && (
                        <div className="flex justify-between">
                          <span className="text-default-600">Description:</span>
                          <span className="text-foreground text-right text-sm">{formData.description}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-default-600">Rate Limit:</span>
                        <span className="text-foreground">{formData.rateLimit > 0 ? `${formData.rateLimit} req/min` : 'Unlimited'}</span>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Endpoints Summary */}
                  <Card className="bg-success-50 border border-success-200">
                    <CardBody className="space-y-3">
                      <div className="font-bold text-success mb-2">Enabled Endpoints</div>
                      {formData.allowedEndpoints.length > 0 ? (
                        <div className="space-y-2">
                          {/* Group endpoints by plugin */}
                          {Array.from(new Set(formData.allowedEndpoints.map(e => e.split('/')[0]))).map((plugin) => (
                            <div key={plugin}>
                              <p className="text-sm font-semibold text-foreground mb-1">{plugin}</p>
                              <div className="flex flex-wrap gap-2 ml-2">
                                {formData.allowedEndpoints
                                  .filter(e => e.startsWith(`${plugin}/`))
                                  .map((endpoint) => (
                                    <Chip
                                      key={endpoint}
                                      size="sm"
                                      variant="flat"
                                      color="success"
                                      className="font-mono text-xs"
                                    >
                                      {endpoint.split('/')[1]}
                                    </Chip>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-default-600 text-sm">No endpoints selected</div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-primary-50 border border-primary-200">
                      <CardBody className="p-3 text-center">
                        <div className="text-primary font-bold text-xl">{new Set(formData.allowedEndpoints.map(e => e.split('/')[0])).size}</div>
                        <div className="text-xs text-default-600">Plugins</div>
                      </CardBody>
                    </Card>
                    <Card className="bg-success-50 border border-success-200">
                      <CardBody className="p-3 text-center">
                        <div className="text-success font-bold text-xl">{formData.allowedEndpoints.length}</div>
                        <div className="text-xs text-default-600">Endpoints</div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </div>
            </ModalBody>
          )}

          <Divider />

          {/* Step Buttons */}
          <ModalFooter className="space-x-2">
            <Button 
              color="danger" 
              variant="light" 
              onPress={() => { onClose(); resetForm(); }}
            >
              Cancel
            </Button>
            {step > 1 && (
              <Button 
                variant="bordered"
                onPress={() => setStep(step - 1)}
              >
                ← Previous
              </Button>
            )}
            {step < 3 ? (
              <Button 
                color="primary"
                onPress={() => {
                  if (step === 1 && !formData.name.trim()) {
                    showAlert('Please enter a key name');
                    return;
                  }
                  if (step === 2 && formData.allowedEndpoints.length === 0) {
                    showAlert('Please enable at least one endpoint');
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Next →
              </Button>
            ) : (
              <Button 
                color="success"
                onClick={isEditMode ? handleUpdateKey : handleCreateKey}
              >
                {isEditMode ? 'Save Changes' : 'Create Key'}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Key Modal */}
      <Modal 
        isOpen={isViewOpen} 
        onClose={onViewClose} 
        size="3xl"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FaEye className="text-primary" />
            API Key Details
          </ModalHeader>
          <Divider />
          <ModalBody className="space-y-4 py-6">
            {viewKey && (
              <>
                {/* Key Information */}
                <Card className="bg-default-50 border border-default-200">
                  <CardBody className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-1">{viewKey.name}</h3>
                      {viewKey.description && (
                        <p className="text-sm text-default-600">{viewKey.description}</p>
                      )}
                    </div>
                    <Divider />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-default-500">Status:</span>
                        <div className="mt-1">
                          <Chip
                            color={viewKey.isActive ? 'success' : 'danger'}
                            variant="flat"
                            size="sm"
                          >
                            {viewKey.isActive ? 'ACTIVE' : 'REVOKED'}
                          </Chip>
                        </div>
                      </div>
                      <div>
                        <span className="text-default-500">Created:</span>
                        <div className="mt-1 text-foreground font-semibold">
                          {new Date(viewKey.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-default-500">Last Used:</span>
                        <div className="mt-1 text-foreground font-semibold">
                          {viewKey.lastUsed ? new Date(viewKey.lastUsed).toLocaleString() : 'Never'}
                        </div>
                      </div>
                      <div>
                        <span className="text-default-500">Rate Limit:</span>
                        <div className="mt-1 text-foreground font-semibold">
                          {viewKey.rateLimit ? `${viewKey.rateLimit} req/min` : 'Unlimited'}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* API Key Value */}
                <Card className="bg-warning-50 border border-warning-200">
                  <CardBody className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-warning">
                        <FaLock />
                        <span className="font-bold">API Key Value</span>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="warning"
                        onClick={() => setShowKeyValue(!showKeyValue)}
                        title={showKeyValue ? "Hide key" : "Show key"}
                      >
                        {showKeyValue ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                    <p className="text-sm text-default-700">
                      For security reasons, the full API key is only shown once during creation. 
                      If you've lost this key, you'll need to revoke it and create a new one.
                    </p>
                    <div className="bg-default-100 p-3 rounded-lg font-mono text-sm text-default-600 border border-default-200 relative">
                      {showKeyValue ? (
                        <div className="text-center py-2 text-warning font-semibold">
                          Key value is not stored and cannot be retrieved
                        </div>
                      ) : (
                        '••••••••••••••••••••••••••••••••'
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Permissions */}
                <Card className="bg-default-50 border border-default-200">
                  <CardBody className="space-y-3">
                    <h4 className="font-bold text-foreground">Permissions & Access</h4>
                    
                    {/* Scopes */}
                    <div>
                      <p className="text-sm text-default-500 mb-2">Scopes ({viewKey.scopes.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {viewKey.scopes.map((scope, idx) => (
                          <Chip key={idx} size="sm" variant="flat" color="primary">
                            {scope}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <Divider />

                    {/* Allowed Endpoints */}
                    {viewKey.allowedEndpoints && viewKey.allowedEndpoints.length > 0 && (
                      <div>
                        <p className="text-sm text-default-500 mb-2">
                          Allowed Endpoints ({viewKey.allowedEndpoints.length}):
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {/* Group by plugin */}
                          {Array.from(new Set(viewKey.allowedEndpoints.map(e => e.split('/')[0]))).map((plugin) => (
                            <div key={plugin} className="bg-success-50 p-2 rounded border border-success-200">
                              <p className="text-xs font-bold text-success mb-1">{plugin}</p>
                              <div className="flex flex-wrap gap-1">
                                {viewKey.allowedEndpoints
                                  ?.filter(e => e.startsWith(`${plugin}/`))
                                  .map((endpoint) => (
                                    <Chip
                                      key={endpoint}
                                      size="sm"
                                      variant="flat"
                                      color="success"
                                      className="font-mono text-xs"
                                    >
                                      {endpoint.split('/')[1]}
                                    </Chip>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blocked Endpoints */}
                    {viewKey.blockedEndpoints && viewKey.blockedEndpoints.length > 0 && (
                      <>
                        <Divider />
                        <div>
                          <p className="text-sm text-default-500 mb-2">
                            Blocked Endpoints ({viewKey.blockedEndpoints.length}):
                          </p>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {viewKey.blockedEndpoints.map((endpoint) => (
                              <Chip
                                key={endpoint}
                                size="sm"
                                variant="flat"
                                color="danger"
                                className="font-mono"
                              >
                                {endpoint}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {(!viewKey.allowedEndpoints || viewKey.allowedEndpoints.length === 0) &&
                     (!viewKey.blockedEndpoints || viewKey.blockedEndpoints.length === 0) && (
                      <div className="text-center py-4 text-default-500">
                        <p>This key has full access to all endpoints</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </>
            )}
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button color="default" variant="light" onPress={onViewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alert Modal */}
      <Modal isOpen={isAlertOpen} onClose={onAlertClose} size="sm">
        <ModalContent>
          <ModalHeader className="flex gap-1">
            <span className="text-primary">Alert</span>
          </ModalHeader>
          <Divider />
          <ModalBody>
            <p className="text-default-700">{alertMessage}</p>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button color="primary" onPress={onAlertClose}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="sm">
        <ModalContent>
          <ModalHeader className="flex gap-1">
            <span className="text-warning">Confirm Action</span>
          </ModalHeader>
          <Divider />
          <ModalBody>
            <p className="text-default-700">{confirmConfig?.message}</p>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button color="default" variant="light" onPress={onConfirmClose}>
              Cancel
            </Button>
            <Button
              color="warning"
              onPress={() => {
                confirmConfig?.onConfirm();
                onConfirmClose();
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
