/**
 * Notes Plugin - Demonstrates Plugin Framework v2.0
 * 
 * Features:
 * - Data storage for notes
 * - Role-based access (users can only see their notes, admins see all)
 * - Theme-aware UI
 * - API endpoints for external access
 */

class NotesPlugin {
  constructor() {
    this.sdk = null;
    this.notes = [];
    this.currentUser = null;
    this.isAdmin = false;
    this.themeUnsubscribe = null;
  }

  async initialize(context) {
    // Initialize the Plugin SDK
    const { createPluginSDK } = window.PluginSDK || {};
    if (!createPluginSDK) {
      console.error('Plugin SDK not available');
      return;
    }

    this.sdk = createPluginSDK({
      pluginName: 'notes',
      convexClient: context.convexClient,
      username: context.username,
      userData: context.userData
    });

    // Get current user info
    this.currentUser = await this.sdk.getCurrentUser();
    if (!this.currentUser) {
      this.sdk.error('User not authenticated');
      return;
    }

    // Check if user is admin
    this.isAdmin = await this.sdk.hasRole('admin');

    // Load notes from storage
    await this.loadNotes();

    // Register API endpoints
    await this.sdk.registerApiEndpoints(['addNote', 'getNotes', 'deleteNote']);

    // Listen for theme changes
    this.themeUnsubscribe = this.sdk.onThemeChange((theme) => {
      this.applyTheme(theme);
    });

    // Start API polling for external requests
    this.startApiPolling();

    this.sdk.log('Notes plugin initialized', {
      user: this.currentUser.username,
      isAdmin: this.isAdmin,
      notesCount: this.notes.length
    });
  }

  async loadNotes() {
    try {
      // Load notes from plugin storage
      const notesData = await this.sdk.getData('notes');
      this.notes = notesData ? notesData : [];

      // If not admin, filter to only show user's notes
      if (!this.isAdmin && this.currentUser) {
        this.notes = this.notes.filter(note => note.author === this.currentUser.username);
      }
    } catch (error) {
      this.sdk.error('Failed to load notes:', error);
      this.notes = [];
    }
  }

  async addNote(title, content) {
    if (!title || !content) {
      alert('Please enter both title and content');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      author: this.currentUser.username,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.notes.push(newNote);
    await this.saveNotes();
    this.updateUI();
    this.sdk.log('Note added:', newNote.title);
  }

  async deleteNote(noteId) {
    const note = this.notes.find(n => n.id === noteId);
    
    // Check if user can delete this note
    if (!this.isAdmin && note.author !== this.currentUser.username) {
      alert('You can only delete your own notes');
      return;
    }

    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    this.notes = this.notes.filter(n => n.id !== noteId);
    await this.saveNotes();
    this.updateUI();
    this.sdk.log('Note deleted:', noteId);
  }

  async saveNotes() {
    try {
      // Load all notes first (in case others have added notes)
      const allNotes = await this.sdk.getData('notes') || [];
      
      // Merge with current notes (keeping all notes from all users)
      const mergedNotes = [...allNotes];
      this.notes.forEach(note => {
        const existingIndex = mergedNotes.findIndex(n => n.id === note.id);
        if (existingIndex >= 0) {
          mergedNotes[existingIndex] = note;
        } else {
          mergedNotes.push(note);
        }
      });

      await this.sdk.setData('notes', mergedNotes);
    } catch (error) {
      this.sdk.error('Failed to save notes:', error);
    }
  }

  createUI(container) {
    const theme = this.sdk.getTheme();
    const isDark = theme === 'dark';

    container.innerHTML = `
      <div id="notes-plugin" style="
        font-family: 'JetBrains Mono', monospace;
        padding: 20px;
        background: ${isDark ? '#1a1a1a' : '#ffffff'};
        color: ${isDark ? '#ffffff' : '#000000'};
        border-radius: 10px;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      ">
        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">
            📝 Notes
            ${this.isAdmin ? '<span style="color: #e74c3c; font-size: 14px;">[Admin Mode]</span>' : ''}
          </h2>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">
            Logged in as: ${this.currentUser.username}
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <input 
            type="text" 
            id="note-title" 
            placeholder="Note title..." 
            style="
              width: 100%;
              padding: 10px;
              margin-bottom: 10px;
              border: 2px solid ${isDark ? '#333' : '#ddd'};
              border-radius: 5px;
              background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
              color: ${isDark ? '#fff' : '#000'};
              font-family: 'JetBrains Mono', monospace;
              font-size: 14px;
            "
          />
          <textarea 
            id="note-content" 
            placeholder="Note content..." 
            style="
              width: 100%;
              padding: 10px;
              margin-bottom: 10px;
              border: 2px solid ${isDark ? '#333' : '#ddd'};
              border-radius: 5px;
              background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
              color: ${isDark ? '#fff' : '#000'};
              font-family: 'JetBrains Mono', monospace;
              font-size: 14px;
              resize: vertical;
              min-height: 80px;
            "
          ></textarea>
          <button 
            id="add-note-btn" 
            style="
              padding: 10px 20px;
              background: #3498db;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-family: 'JetBrains Mono', monospace;
              font-size: 14px;
              font-weight: bold;
            "
          >
            Add Note
          </button>
        </div>

        <div style="
          flex: 1;
          overflow-y: auto;
          border-top: 2px solid ${isDark ? '#333' : '#ddd'};
          padding-top: 10px;
        ">
          <div id="notes-list"></div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelector('#add-note-btn').addEventListener('click', async () => {
      const title = container.querySelector('#note-title').value.trim();
      const content = container.querySelector('#note-content').value.trim();
      
      if (title && content) {
        await this.addNote(title, content);
        container.querySelector('#note-title').value = '';
        container.querySelector('#note-content').value = '';
      } else {
        alert('Please enter both title and content');
      }
    });

    // Initial render
    this.updateUI();
  }

  updateUI() {
    const notesList = document.querySelector('#notes-list');
    if (!notesList) return;

    const theme = this.sdk.getTheme();
    const isDark = theme === 'dark';

    if (this.notes.length === 0) {
      notesList.innerHTML = `
        <div style="text-align: center; padding: 40px; opacity: 0.5;">
          No notes yet. Create your first note!
        </div>
      `;
      return;
    }

    // Sort notes by date (newest first)
    const sortedNotes = [...this.notes].sort((a, b) => b.createdAt - a.createdAt);

    notesList.innerHTML = sortedNotes.map(note => `
      <div style="
        background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        border: 2px solid ${isDark ? '#333' : '#ddd'};
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">
            ${this.escapeHtml(note.title)}
          </h3>
          <button 
            class="delete-note-btn" 
            data-note-id="${note.id}"
            style="
              background: #e74c3c;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 5px 10px;
              cursor: pointer;
              font-size: 12px;
            "
          >
            Delete
          </button>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 13px; white-space: pre-wrap;">
          ${this.escapeHtml(note.content)}
        </p>
        <div style="font-size: 11px; opacity: 0.6;">
          ${note.author} • ${new Date(note.createdAt).toLocaleString()}
        </div>
      </div>
    `).join('');

    // Add delete button listeners
    notesList.querySelectorAll('.delete-note-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const noteId = e.target.getAttribute('data-note-id');
        this.deleteNote(noteId);
      });
    });
  }

  applyTheme(theme) {
    const container = document.querySelector('#notes-plugin');
    if (!container) return;

    const isDark = theme === 'dark';
    container.style.background = isDark ? '#1a1a1a' : '#ffffff';
    container.style.color = isDark ? '#ffffff' : '#000000';

    // Re-render to update all styled elements
    this.updateUI();
  }

  async startApiPolling() {
    // Poll for API calls every 2 seconds
    setInterval(async () => {
      try {
        const allData = await this.sdk.getAllData();
        
        for (const item of allData) {
          if (item.key.startsWith('api_call_')) {
            const callData = item.value;
            await this.handleApiCall(callData, item.key);
            await this.sdk.deleteData(item.key);
          }
        }
      } catch (error) {
        this.sdk.error('API polling error:', error);
      }
    }, 2000);
  }

  async handleApiCall(callData, callKey) {
    const { endpoint, method, body } = callData;
    this.sdk.log('API call received:', endpoint, method);

    try {
      let result = null;

      if (endpoint === 'addNote' && method === 'POST' && body) {
        await this.addNote(body.title, body.content);
        result = { success: true, message: 'Note added' };
      } else if (endpoint === 'getNotes' && method === 'GET') {
        result = { success: true, notes: this.notes };
      } else if (endpoint === 'deleteNote' && method === 'DELETE' && body) {
        await this.deleteNote(body.noteId);
        result = { success: true, message: 'Note deleted' };
      }

      // Store result for API caller
      if (result) {
        await this.sdk.setData(callKey + '_result', result);
      }
    } catch (error) {
      this.sdk.error('API call handling error:', error);
      await this.sdk.setData(callKey + '_result', {
        success: false,
        error: error.message
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    if (this.themeUnsubscribe) {
      this.themeUnsubscribe();
    }
    this.sdk.log('Notes plugin destroyed');
  }
}

// Export the plugin
window.NotesPlugin = NotesPlugin;
