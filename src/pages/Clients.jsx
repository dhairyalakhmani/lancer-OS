// src/pages/Clients.jsx
import { useState, useMemo, useCallback, useEffect, useContext } from 'react';
// 🚀 ADDED 'updateDoc' for the Edit feature
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../context/AuthContext';
// 🚀 ADDED 'Edit2' icon
import { Plus, Building2, Mail, MoreVertical, Search, X, Loader2, Trash2, AlertCircle, Edit2 } from 'lucide-react';

const Clients = () => {
  const { currentUser } = useContext(AuthContext);
  
  // Form & UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Data State
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact: '', email: '', status: 'Active' });

  // 1. READ: Real-time listener
  useEffect(() => {
    if (!currentUser) return;

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setNetworkError(true);
      }
    }, 5000);

    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const userClients = clientData.filter(client => client.userId === currentUser.uid);
      setClients(userClients);
      setIsLoading(false);
      setNetworkError(false);
      clearTimeout(timeoutId);
    }, (error) => {
      console.error("Error fetching clients:", error);
      setIsLoading(false);
      setNetworkError(true);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [currentUser, isLoading]);

  // UI Handlers for Form
  const handleOpenAdd = () => {
    setFormData({ name: '', contact: '', email: '', status: 'Active' });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client) => {
    setFormData({ 
      name: client.name, 
      contact: client.contact, 
      email: client.email, 
      status: client.status || 'Active' 
    });
    setEditingId(client.id);
    setIsFormOpen(true);
    setOpenDropdownId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up so user sees the form
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  // 2. CREATE & UPDATE: Submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    
    // Create a 5-second timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("NETWORK_TIMEOUT")), 5000);
    });

    try {
      if (editingId) {
        // UPDATE EXISTING CLIENT
        const clientRef = doc(db, 'clients', editingId);
        // Race the update against the timeout
        await Promise.race([
          updateDoc(clientRef, {
            name: formData.name,
            contact: formData.contact,
            email: formData.email,
            status: formData.status
          }),
          timeoutPromise
        ]);
      } else {
        // CREATE NEW CLIENT
        // Race the creation against the timeout
        await Promise.race([
          addDoc(collection(db, 'clients'), {
            ...formData,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
          }),
          timeoutPromise
        ]);
      }
      // If we reach here, the database save was successful!
      handleCloseForm();
    } catch (error) {
      console.error("Error saving document: ", error);
      if (error.message === "NETWORK_TIMEOUT") {
        alert("The server took too long to respond. Your browser or adblocker might be blocking the connection.");
        // We still close the form because the local cache has the data, 
        // but we warn the user it might not be backed up.
        handleCloseForm(); 
      } else {
        alert("Failed to save client.");
      }
    } finally {
      // No matter what happens, ALWAYS unlock the button
      setIsSaving(false);
    }
  }, [formData, currentUser, editingId]);

  // 3. DELETE
  const handleDeleteClient = useCallback(async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'clients', clientId));
        setOpenDropdownId(null);
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete client.");
      }
    }
  }, []);

  // Optimized Search
  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-6" onClick={() => setOpenDropdownId(null)}>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Clients</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your client roster and contact information.</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); isFormOpen ? handleCloseForm() : handleOpenAdd(); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white text-sm font-medium rounded-md transition-colors"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Cancel' : 'Add Client'}
        </button>
      </div>

      {/* Network Error Warning */}
      {networkError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 flex items-start gap-3 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Connection Blocked</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              We couldn't connect to the database. Please ensure your adblocker or Brave Shields are disabled for localhost.
            </p>
          </div>
        </div>
      )}

      {/* Add / Edit Client Form */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm animate-in slide-in-from-top-4 fade-in duration-200" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {editingId ? 'Edit Client Details' : 'New Client Details'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm" placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Primary Contact</label>
              <input required type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm" placeholder="e.g. Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" disabled={isSaving} className="w-full md:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 disabled:opacity-70 text-white font-medium rounded-md transition-colors flex justify-center items-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update Client' : 'Save Client')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none" />
        </div>
      </div>

      {/* Client List Area */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold uppercase">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{client.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${client.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {client.status}
                    </span>
                  </div>
                </div>
                
                {/* Active 3-Dots Dropdown Menu */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === client.id ? null : client.id); }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {openDropdownId === client.id && (
                    <div 
                      className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10 animate-in fade-in slide-in-from-top-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 🚀 NEW: Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Building2 className="w-4 h-4" />
                  {client.contact}
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${client.email}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {client.email}
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          {/* 🚀 Custom SVG Empty State */}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              
              {/* Elegant Empty Contact Card Illustration */}
              <svg 
                className="w-32 h-32 mb-6" 
                viewBox="0 0 120 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background card structure */}
                <rect x="20" y="25" width="80" height="70" rx="8" className="fill-slate-50 dark:fill-slate-900/50 stroke-slate-200 dark:stroke-slate-700" strokeWidth="4"/>
                
                {/* Top ID Badge Clip */}
                <path d="M45 25V20C45 17.2386 47.2386 15 50 15H70C72.7614 15 75 17.2386 75 20V25" className="fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700" strokeWidth="4" strokeLinecap="round"/>
                
                {/* User Silhouette / Avatar Placeholder */}
                <circle cx="60" cy="55" r="12" className="fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="4"/>
                <path d="M40 80C40 72 48 68 60 68C72 68 80 72 80 80" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="4" strokeLinecap="round"/>
                
                {/* Searching Sparkle (Only shows when searching) */}
                {searchQuery && (
                  <path d="M85 30L95 20M95 20L105 30M95 20V40" className="stroke-primary-500" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {searchQuery ? 'No matches found' : 'No clients yet'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery 
                  ? `We couldn't find any clients matching "${searchQuery}". Try adjusting your search.` 
                  : "Click 'Add Client' to set up your first connection."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Clients;