import React, { useState, useRef } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface PageProps {
  username?: string;
  userData?: Record<string, unknown>;
}

interface UploadedFile {
  file: File;
  base64: string;
  isValid: boolean;
  error?: string;
}

export const PluginPublisherPage: React.FC<PageProps> = () => {

  const [pluginData, setPluginData] = useState<{
    name: string;
    author: string;
    version: string;
    description: string;
  } | null>(null);
  const [includeIcon, setIncludeIcon] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    manifest?: UploadedFile;
    core?: UploadedFile;
    icon?: UploadedFile;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [editingPlugin, setEditingPlugin] = useState<{ name: string, author: string, version: string, description?: string } | null>(null);

  const manifestRef = useRef<HTMLInputElement>(null);
  const coreRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploadPluginAction = useAction((api.context as any).uploadPluginAction);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deletePluginAction = useAction((api.context as any).deletePluginAction);

  // Fetch all plugins for management
  const allPlugins = useQuery(api.context.getAllPlugins);

  // const validateFileName = (fileName: string, expectedPrefix: string, expectedExtension: string, pluginName: string): boolean => {
  //   const expectedName = `${expectedPrefix}-${pluginName}.${expectedExtension}`;
  //   return fileName === expectedName;
  // };

  const validateFileContent = async (file: File, type: 'manifest' | 'core' | 'icon'): Promise<{ isValid: boolean; error?: string }> => {
    try {
      const content = await file.text();

      switch (type) {
        case 'manifest':
          const manifest = JSON.parse(content);
          if (!manifest.name || !manifest.version || !manifest.author) {
            return { isValid: false, error: 'Manifest must contain name, version, and author fields' };
          }
          return { isValid: true };

        case 'core':
          if (!content.includes('function') && !content.includes('const') && !content.includes('let') && !content.includes('var') && !content.includes('class') && !content.includes('export')) {
            return { isValid: false, error: 'Core file must contain valid JavaScript code' };
          }
          return { isValid: true };

        case 'icon':
          if (!content.includes('<svg') || !content.includes('</svg>')) {
            return { isValid: false, error: 'Icon file must be valid SVG format' };
          }
          return { isValid: true };

        default:
          return { isValid: false, error: 'Unknown file type' };
      }
    } catch (error) {
      return { isValid: false, error: `Invalid file format: ${error}` };
    }
  };

  const handleFileUpload = async (file: File, type: 'manifest' | 'core' | 'icon') => {
    const validation = await validateFileContent(file, type);
    if (!validation.isValid) {
      setUploadStatus({ type: 'error', message: validation.error || 'Invalid file' });
      return;
    }

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Content = result.split(',')[1]; // Remove data:type;base64, prefix
        console.log(`File ${type} base64 length:`, base64Content.length);
        console.log(`File ${type} base64 preview:`, base64Content.substring(0, 50) + "...");
        resolve(base64Content);
      };
      reader.readAsDataURL(file);
    });

    setUploadedFiles(prev => ({
      ...prev,
      [type]: { file, base64, isValid: true }
    }));

    // If this is a manifest file, extract plugin data
    if (type === 'manifest') {
      try {
        const content = await file.text();
        const manifest = JSON.parse(content);

        // Extract plugin data from manifest
        const extractedData = {
          name: manifest.name || '',
          author: manifest.author || '',
          version: manifest.version || '',
          description: manifest.description || ''
        };

        setPluginData(extractedData);
        setUploadStatus({
          type: 'success',
          message: `Manifest loaded successfully! Plugin: ${extractedData.name} v${extractedData.version}`
        });
      } catch {
        setUploadStatus({
          type: 'error',
          message: 'Failed to parse manifest file'
        });
        return;
      }
    } else {
      setUploadStatus({ type: 'success', message: `${type.charAt(0).toUpperCase() + type.slice(1)} file uploaded successfully` });
    }
  };

  const handleFileRemove = (type: 'manifest' | 'core' | 'icon') => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[type];
      return newFiles;
    });

    // Clear file input
    if (type === 'manifest' && manifestRef.current) {
      manifestRef.current.value = '';
      setPluginData(null); // Clear plugin data when manifest is removed
    } else if (type === 'core' && coreRef.current) {
      coreRef.current.value = '';
    } else if (type === 'icon' && iconRef.current) {
      iconRef.current.value = '';
    }

    setUploadStatus({ type: 'info', message: `${type.charAt(0).toUpperCase() + type.slice(1)} file removed` });
  };

  const handleUpload = async () => {
    if (!uploadedFiles.manifest || !uploadedFiles.core) {
      setUploadStatus({ type: 'error', message: 'Manifest and core files are required' });
      return;
    }

    if (!pluginData) {
      setUploadStatus({ type: 'error', message: 'Please upload manifest file first to load plugin data' });
      return;
    }

    if (includeIcon && !uploadedFiles.icon) {
      setUploadStatus({ type: 'error', message: 'Icon file is required when "Include Icon" is checked' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Uploading plugin...' });

    try {
      console.log("Uploading plugin with data:");
      console.log("Plugin data:", pluginData);
      console.log("Manifest file length:", uploadedFiles.manifest.base64.length);
      console.log("Core file length:", uploadedFiles.core.base64.length);
      console.log("Icon file length:", uploadedFiles.icon?.base64?.length || 0);

      await uploadPluginAction({
        pluginName: pluginData.name,
        author: pluginData.author,
        version: pluginData.version,
        description: pluginData.description,
        manifestFile: uploadedFiles.manifest.base64,
        coreFile: uploadedFiles.core.base64,
        iconFile: uploadedFiles.icon?.base64,
      });

      setUploadStatus({ type: 'success', message: 'Plugin uploaded successfully!' });

      // Reset form
      setPluginData(null);
      setIncludeIcon(false);
      setUploadedFiles({});

      // Clear file inputs
      if (manifestRef.current) manifestRef.current.value = '';
      if (coreRef.current) coreRef.current.value = '';
      if (iconRef.current) iconRef.current.value = '';

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileStatus = (type: 'manifest' | 'core' | 'icon') => {
    const file = uploadedFiles[type];
    if (!file) return { status: 'empty', message: 'No file uploaded' };
    if (file.isValid) return { status: 'valid', message: 'File is valid' };
    return { status: 'invalid', message: file.error || 'File is invalid' };
  };

  const handleDeletePlugin = async (pluginName: string) => {
    if (!confirm(`Are you sure you want to delete the plugin "${pluginName}"? This will remove it from all users and cannot be undone.`)) {
      return;
    }

    try {
      setUploadStatus({ type: 'info', message: `Deleting plugin "${pluginName}" and cleaning up user data...` });
      const result = await deletePluginAction({ pluginName });

      if (result && typeof result.usersUpdated === 'number') {
        if (result.usersUpdated > 0) {
          setUploadStatus({
            type: 'success',
            message: `Plugin "${pluginName}" deleted successfully! Removed from ${result.usersUpdated} user(s).`
          });
        } else {
          setUploadStatus({
            type: 'success',
            message: `Plugin "${pluginName}" deleted successfully! (No users had this plugin installed)`
          });
        }
      } else {
        setUploadStatus({
          type: 'success',
          message: `Plugin "${pluginName}" deleted successfully!`
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Failed to delete plugin: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleEditPlugin = (plugin: { name: string, author: string, version: string, description?: string }) => {
    setEditingPlugin(plugin);
    setPluginData({
      name: plugin.name,
      author: plugin.author,
      version: plugin.version,
      description: plugin.description || ''
    });

    setUploadStatus({ type: 'info', message: `Editing plugin "${plugin.name}". Upload new files to update.` });
  };

  const resetForm = () => {
    setPluginData(null);
    setEditingPlugin(null);
    setIncludeIcon(false);
    setUploadedFiles({});
    setUploadStatus(null);

    // Clear file inputs
    if (manifestRef.current) manifestRef.current.value = '';
    if (coreRef.current) coreRef.current.value = '';
    if (iconRef.current) iconRef.current.value = '';
  };

  const renderPluginList = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '10px',
      flex: '1',
      overflowY: 'auto',
      paddingRight: '5px',
      alignContent: 'start'
    }}>
      {allPlugins && allPlugins.length > 0 ? (
        allPlugins.map((plugin) => (
          <div
            key={plugin._id}
            style={{
              backgroundColor: '#2c3e50',
              borderRadius: '10px',
              padding: '10px',
              border: '2px solid #e74c3c',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              height: '140px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#95a5a6',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#ffffff',
                overflow: 'hidden'
              }}>
                🔌
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleEditPlugin(plugin)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  title="Edit Plugin"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeletePlugin(plugin.name)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  title="Delete Plugin"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div style={{
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '2px',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {plugin.name}
            </div>

            <div style={{
              color: '#bdc3c7',
              fontSize: '9px',
              marginBottom: '4px',
              lineHeight: '1.2',
              flex: '1',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}>
              {plugin.description || `${plugin.name} plugin`}
            </div>

            <div style={{
              color: plugin.isActive ? '#27ae60' : '#e74c3c',
              fontSize: '9px',
              fontWeight: 'bold',
              marginTop: 'auto'
            }}>
              {plugin.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))
      ) : (
        <div style={{
          gridColumn: '1 / -1',
          padding: '40px',
          textAlign: 'center',
          color: '#95a5a6',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          No plugins found.
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      height: 'calc(100vh - 40px)',
      padding: '20px',
      fontFamily: 'JetBrains Mono, monospace',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      {/* Left Panel - Upload/Edit Form */}
      <div style={{
        width: 'calc(50% - 10px)',
        backgroundColor: '#0F2044',
        borderRadius: '20px',
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: editingPlugin ? '3px solid #e74c3c' : 'none',
        position: 'relative',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <h2 style={{
          color: '#ffffff',
          margin: '0 0 10px 0',
          fontSize: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {editingPlugin ? 'EDIT PLUGIN' : 'UPLOAD PLUGIN'}
          {editingPlugin && (
            <button
              onClick={resetForm}
              style={{
                padding: '6px 12px',
                backgroundColor: '#95a5a6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              CANCEL
            </button>
          )}
        </h2>

        {/* Status Message */}
        {uploadStatus && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: uploadStatus.type === 'success' ? 'rgba(39, 174, 96, 0.2)' :
              uploadStatus.type === 'error' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)',
            color: '#ffffff',
            border: `1px solid ${uploadStatus.type === 'success' ? '#27ae60' :
              uploadStatus.type === 'error' ? '#e74c3c' : '#3498db'}`,
            fontSize: '12px',
            marginBottom: '10px'
          }}>
            {uploadStatus.message}
          </div>
        )}

        {/* File Upload Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Manifest */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => manifestRef.current?.click()}
              style={{
                flex: '1',
                padding: '14px',
                backgroundColor: uploadedFiles.manifest?.isValid ? '#27ae60' : '#2c3e50',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <span>📄 Manifest (.json)</span>
              {uploadedFiles.manifest && <span>✓</span>}
            </button>
            <input
              ref={manifestRef}
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'manifest');
              }}
              style={{ display: 'none' }}
            />
            {uploadedFiles.manifest && (
              <button
                onClick={() => handleFileRemove('manifest')}
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: '#e74c3c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Core */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => coreRef.current?.click()}
              style={{
                flex: '1',
                padding: '14px',
                backgroundColor: uploadedFiles.core?.isValid ? '#27ae60' : '#2c3e50',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <span>⚙️ Core (.js)</span>
              {uploadedFiles.core && <span>✓</span>}
            </button>
            <input
              ref={coreRef}
              type="file"
              accept=".js"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'core');
              }}
              style={{ display: 'none' }}
            />
            {uploadedFiles.core && (
              <button
                onClick={() => handleFileRemove('core')}
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: '#e74c3c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Icon Toggle & Upload */}
          <div style={{ marginTop: '5px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              fontSize: '12px',
              marginBottom: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={includeIcon}
                onChange={(e) => setIncludeIcon(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Include Icon File
            </label>

            {includeIcon && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => iconRef.current?.click()}
                  style={{
                    flex: '1',
                    padding: '14px',
                    backgroundColor: uploadedFiles.icon?.isValid ? '#27ae60' : '#2c3e50',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>🎨 Icon (.svg)</span>
                  {uploadedFiles.icon && <span>✓</span>}
                </button>
                <input
                  ref={iconRef}
                  type="file"
                  accept=".svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'icon');
                  }}
                  style={{ display: 'none' }}
                />
                {uploadedFiles.icon && (
                  <button
                    onClick={() => handleFileRemove('icon')}
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: '#e74c3c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Plugin Info Preview */}
        {pluginData && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '15px',
            marginTop: '10px'
          }}>
            <h3 style={{ color: '#ffffff', fontSize: '14px', margin: '0 0 10px 0' }}>PREVIEW</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div>
                <span style={{ color: '#95a5a6', fontSize: '11px' }}>NAME</span>
                <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{pluginData.name}</div>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <span style={{ color: '#95a5a6', fontSize: '11px' }}>VERSION</span>
                  <div style={{ color: '#ffffff' }}>{pluginData.version}</div>
                </div>
                <div>
                  <span style={{ color: '#95a5a6', fontSize: '11px' }}>AUTHOR</span>
                  <div style={{ color: '#ffffff' }}>{pluginData.author}</div>
                </div>
              </div>
              {pluginData.description && (
                <div>
                  <span style={{ color: '#95a5a6', fontSize: '11px' }}>DESCRIPTION</span>
                  <div style={{ color: '#ffffff', fontSize: '12px', lineHeight: '1.4' }}>{pluginData.description}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={isUploading || !pluginData || !uploadedFiles.manifest || !uploadedFiles.core || (includeIcon && !uploadedFiles.icon)}
          style={{
            marginTop: 'auto',
            padding: '16px',
            backgroundColor: isUploading ? '#95a5a6' : (editingPlugin ? '#e74c3c' : '#27ae60'),
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            cursor: (isUploading || !pluginData || !uploadedFiles.manifest || !uploadedFiles.core || (includeIcon && !uploadedFiles.icon)) ? 'not-allowed' : 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease'
          }}
        >
          {isUploading ? 'UPLOADING...' : !pluginData ? 'UPLOAD MANIFEST FIRST' : editingPlugin ? 'UPDATE PLUGIN' : 'UPLOAD PLUGIN'}
        </button>
      </div>

      {/* Right Panel - Plugin List */}
      <div style={{
        width: 'calc(50% - 10px)',
        backgroundColor: '#0F2044',
        borderRadius: '20px',
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#ffffff', margin: '0 0 5px 0', fontSize: '20px' }}>INSTALLED PLUGINS</h2>
        {renderPluginList()}
      </div>
    </div>
  );
};