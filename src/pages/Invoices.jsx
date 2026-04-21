import { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, FileText, MoreVertical, Trash2, Download, PlusCircle, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const Invoices = () => {
  const { currentUser } = useContext(AuthContext);

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [clientName, setClientName] = useState('');
  const [taxRate, setTaxRate] = useState(10);
  const [lineItems, setLineItems] = useState([
    { id: '1', description: '', quantity: 1, rate: 0 }
  ]);

  useEffect(() => {
    if (!currentUser) return;

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setNetworkError(true);
      }
    }, 5000);

    const invoicesRef = collection(db, 'invoices');
    const q = query(invoicesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoiceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const userInvoices = invoiceData.filter(inv => inv.userId === currentUser.uid);
      setInvoices(userInvoices);
      setIsLoading(false);
      setNetworkError(false);
      clearTimeout(timeoutId);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
      setNetworkError(true);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [currentUser, isLoading]);

  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (!event.target.closest('[data-dropdown-btn]')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleToggleStatus = useCallback(async (invoice) => {
    const newStatus = invoice.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      const invoiceRef = doc(db, 'invoices', invoice.id);
      await updateDoc(invoiceRef, { status: newStatus });
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  }, []);

  const handleDeleteInvoice = useCallback(async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'invoices', invoiceId));
        setOpenDropdownId(null);
      } catch (error) {
        console.error(error);
        alert("Failed to delete invoice.");
      }
    }
  }, []);

  const handleDownloadReceipt = useCallback((invoice) => {
    const receiptText = `
==================================
       INVOICE: ${invoice.displayId}
==================================
Client: ${invoice.client}
Date: ${invoice.date}
Status: ${invoice.status}

----------------------------------
TOTAL DUE: $${invoice.amount.toFixed(2)}
==================================
Thank you for your business!
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.displayId}-Receipt.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setOpenDropdownId(null);
  }, []);

  const handleAddLineItem = useCallback(() => {
    setLineItems(prev => [...prev, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  }, []);

  const handleRemoveLineItem = useCallback((idToRemove) => {
    setLineItems(prev => prev.filter(item => item.id !== idToRemove));
  }, []);

  const handleUpdateLineItem = useCallback((id, field, value) => {
    setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) } : item));
  }, []);

  const subtotal = useMemo(() => lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0), [lineItems]);
  const taxAmount = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const handleSaveInvoice = useCallback(async (e) => {
    e.preventDefault();
    if (!clientName.trim() || lineItems.length === 0 || !currentUser) return;
    setIsSaving(true);
    const timeoutPromise = new Promise((_, reject) => { setTimeout(() => reject(new Error("NETWORK_TIMEOUT")), 5000); });
    try {
      await Promise.race([
        addDoc(collection(db, 'invoices'), {
          displayId: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          client: clientName,
          amount: total,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
          lineItems: lineItems,
          taxRate: taxRate,
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        }),
        timeoutPromise
      ]);
      setIsModalOpen(false);
      setClientName('');
      setLineItems([{ id: '1', description: '', quantity: 1, rate: 0 }]);
    } catch (error) {
      console.error(error);
      alert(error.message === "NETWORK_TIMEOUT" ? "The server took too long to respond." : "Failed to save invoice.");
    } finally {
      setIsSaving(false);
    }
  }, [clientName, total, lineItems, taxRate, currentUser]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage billing, track payments, and send invoices.</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white text-sm font-medium rounded-md transition-colors">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {networkError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 flex items-start gap-3 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">Please ensure your adblocker or Brave Shields are disabled.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
      ) : invoices.length === 0 ? (
         <div className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
           <FileText className="w-8 h-8 text-slate-400 mb-4" />
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No invoices yet</h3>
         </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> {invoice.displayId}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{invoice.client}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{invoice.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">${invoice.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>{invoice.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button data-dropdown-btn onClick={(e) => { e.stopPropagation(); setOpenDropdownId(prev => prev === invoice.id ? null : invoice.id); }} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><MoreVertical className="w-5 h-5" /></button>
                      {openDropdownId === invoice.id && (
                        <div className="absolute right-12 top-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-[100] animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleToggleStatus(invoice)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 transition-colors">
                            {invoice.status === 'Paid' ? <><Clock className="w-4 h-4 text-orange-500" /> Mark as Pending</> : <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mark as Paid</>}
                          </button>
                          <button onClick={() => handleDownloadReceipt(invoice)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 transition-colors"><Download className="w-4 h-4 text-indigo-500" /> Download Receipt</button>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                          <button onClick={() => handleDeleteInvoice(invoice.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"><Trash2 className="w-4 h-4" /> Delete Invoice</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Invoice</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveInvoice} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Client Name</label><input required type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Acme Corp" className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tax Rate (%)</label><input type="number" min="0" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white sm:text-sm" /></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Line Items</h3>
                <div className="space-y-3">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input type="text" required value={item.description} onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)} placeholder="Description" className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                      <div className="flex items-center gap-3">
                        <input type="number" min="1" required value={item.quantity} onChange={(e) => handleUpdateLineItem(item.id, 'quantity', e.target.value)} className="w-20 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        <input type="number" min="0" step="0.01" required value={item.rate} onChange={(e) => handleUpdateLineItem(item.id, 'rate', e.target.value)} className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        <div className="w-20 text-right font-medium text-slate-900 dark:text-white text-sm">${(item.quantity * item.rate).toFixed(2)}</div>
                        <button type="button" onClick={() => handleRemoveLineItem(item.id)} disabled={lineItems.length === 1} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddLineItem} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"><PlusCircle className="w-4 h-4" /> Add Item</button>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col items-end gap-2 text-sm">
                <div className="flex justify-between w-48 text-slate-600 dark:text-slate-400"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between w-48 text-slate-900 dark:text-white font-bold text-lg mt-2"><span>Total:</span><span>${total.toFixed(2)}</span></div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 rounded-md">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;