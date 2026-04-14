import { useState, useEffect } from 'react';
import API from '../services/api';
import { Trash2, Edit2, Search, Upload, Download } from 'lucide-react';

const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Entertainment', 'Shopping', 
                    'Healthcare', 'Education', 'Transfer', 'ATM', 'Subscription', 
                    'Salary', 'Freelance', 'Gifts', 'Other'];

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterAccount, setFilterAccount] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filterType, filterCategory, filterAccount, sortBy]);

  const fetchTransactions = async () => {
    try {
      const { data } = await API.get('/transactions');
      setTransactions(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'All') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    if (filterAccount !== 'all') {
      if (filterAccount === 'unspecified') {
        filtered = filtered.filter(t => !t.accountType);
      } else {
        filtered = filtered.filter(t => t.accountType === filterAccount);
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await API.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        alert('Failed to delete transaction');
      }
    }
  };

  const handleDeleteAllCSV = async () => {
    const csvTransactions = transactions.filter(t => t.importedFrom === 'csv');
    
    if (csvTransactions.length === 0) {
      alert('No CSV imported transactions found.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${csvTransactions.length} CSV imported transactions? This cannot be undone!`
    );

    if (!confirmed) return;

    try {
      const { data } = await API.delete('/csv/delete-all');
      alert(data.message);
      fetchTransactions();
    } catch (error) {
      alert('Failed to delete CSV transactions: ' + (error.response?.data?.message || error.message));
    }
  };

  const startEdit = (transaction) => {
    setEditingId(transaction._id);
    setEditForm({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
  };

  const handleUpdate = async (id) => {
    try {
      await API.put(`/transactions/${id}`, editForm);
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      alert('Failed to update transaction');
    }
  };

  const exportToCSV = () => {
    const escapeField = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Account'];
    const csvData = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.amount,
      t.description,
      t.accountType || 'unspecified'
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(escapeField).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-benji-vault">
        <div className="text-xl dark:text-white">Loading transactions...</div>
      </div>
    );
  }

  const csvCount = transactions.filter(t => t.importedFrom === 'csv').length;

  return (
    <div className="min-h-screen bg-benji-cream dark:bg-benji-vault transition-colors">
      <div className="w-full px-4 py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-benji-forest dark:text-benji-mist">All Transactions</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCSVUpload(true)}
              className="bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-jade-dim dark:hover:bg-benji-jade text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Upload size={20} />
              Import CSV
            </button>
            <button
              onClick={exportToCSV}
              className="bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-gold dark:hover:bg-benji-gold-light text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Download size={20} />
              Export CSV
            </button>
            {csvCount > 0 && (
              <button
                onClick={handleDeleteAllCSV}
                className="bg-benji-brick hover:bg-benji-brick/90 dark:bg-benji-coral dark:hover:bg-benji-coral/90 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Trash2 size={20} />
                Delete All CSV ({csvCount})
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-benji-paper dark:bg-benji-vault-card p-4 rounded-xl shadow-warm dark:shadow-vault mb-4 border border-benji-sage/10 dark:border-benji-gold/10 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-benji-ink/40 dark:text-benji-mist-dim/40" size={20} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold dark:bg-benji-vault-card dark:text-benji-mist transition-colors"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold dark:bg-benji-vault-card dark:text-benji-mist transition-colors"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold dark:bg-benji-vault-card dark:text-benji-mist transition-colors"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Account Filter */}
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="px-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold dark:bg-benji-vault-card dark:text-benji-mist transition-colors"
            >
              <option value="all">All Accounts</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="unspecified">Unspecified</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold dark:bg-benji-vault-card dark:text-benji-mist transition-colors"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <p className="text-sm text-benji-ink dark:text-benji-mist-dim">
              Showing {filteredTransactions.length} of {transactions.length} transactions
              {csvCount > 0 && <span className="ml-2 text-benji-sage-dark dark:text-benji-gold">({csvCount} from CSV)</span>}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterCategory('All');
                setFilterAccount('all');
                setSortBy('date-desc');
              }}
              className="text-sm text-benji-sage-dark dark:text-benji-gold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-warm dark:shadow-vault overflow-hidden border border-benji-sage/10 dark:border-benji-gold/10 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-benji-cream/50 dark:bg-benji-vault-up">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-benji-ink dark:text-benji-mist-dim uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-benji-paper dark:bg-benji-vault-card divide-y divide-benji-sage/10 dark:divide-benji-gold/10">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-benji-ink/70 dark:text-benji-mist-dim/70">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-benji-cream/50 dark:hover:bg-benji-vault-up transition-colors">
                      {editingId === transaction._id ? (
                        // Edit Mode
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="w-full px-2 py-1 border rounded dark:bg-benji-vault-up dark:text-benji-mist dark:border-benji-gold/20"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-2 py-1 border rounded dark:bg-benji-vault-up dark:text-benji-mist dark:border-benji-gold/20"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="w-full px-2 py-1 border rounded dark:bg-benji-vault-up dark:text-benji-mist dark:border-benji-gold/20"
                            >
                              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                              className="w-full px-2 py-1 border rounded dark:bg-benji-vault-up dark:text-benji-mist dark:border-benji-gold/20"
                            >
                              <option value="income">Income</option>
                              <option value="expense">Expense</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                              className="w-full px-2 py-1 border rounded dark:bg-benji-vault-up dark:text-benji-mist dark:border-benji-gold/20"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70">
                              {transaction.accountType || 'unspecified'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70">
                              {transaction.importedFrom || 'manual'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleUpdate(transaction._id)}
                              className="text-benji-moss dark:text-benji-jade hover:text-benji-sage-dark dark:hover:text-benji-jade mr-3"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-benji-ink/60 dark:text-benji-mist-dim/60 hover:text-benji-forest dark:hover:text-benji-mist"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-benji-forest dark:text-benji-mist">
                            {transaction.description || transaction.merchantName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-benji-sage/20 dark:bg-benji-gold/20 text-benji-sage-dark dark:text-benji-gold">
                              {transaction.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === 'income' 
                                ? 'bg-benji-sage/15 dark:bg-benji-jade/15 text-benji-moss dark:text-benji-jade' 
                                : 'bg-benji-brick/15 dark:bg-benji-coral/15 text-benji-brick dark:text-benji-coral'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.type === 'income' 
                              ? 'text-benji-moss dark:text-benji-jade' 
                              : 'text-benji-brick dark:text-benji-coral'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.accountType === 'checking'
                                ? 'bg-benji-sage/15 dark:bg-benji-jade/15 text-benji-moss dark:text-benji-jade'
                                : transaction.accountType === 'savings'
                                ? 'bg-benji-gold/15 dark:bg-benji-gold/10 text-benji-gold dark:text-benji-gold-light'
                                : 'bg-benji-cream/70 dark:bg-benji-vault-up text-benji-forest dark:text-benji-mist'
                            }`}>
                              {transaction.accountType || 'unspecified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.importedFrom === 'csv' 
                                ? 'bg-benji-gold/15 dark:bg-benji-gold/10 text-benji-gold dark:text-benji-gold-light' 
                                : 'bg-benji-cream/70 dark:bg-benji-vault-up text-benji-forest dark:text-benji-mist'
                            }`}>
                              {transaction.importedFrom || 'manual'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => startEdit(transaction)}
                              className="text-benji-sage-dark dark:text-benji-gold hover:text-benji-sage dark:hover:text-benji-gold-light mr-3"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction._id)}
                              className="text-benji-brick dark:text-benji-coral hover:text-benji-brick/80 dark:hover:text-benji-coral/80"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSV Upload Modal */}
        {showCSVUpload && (
          <CSVUploadModal
            onClose={() => setShowCSVUpload(false)}
            onSuccess={() => {
              setShowCSVUpload(false);
              fetchTransactions();
            }}
          />
        )}
      </div>
    </div>
  );
}

// CSV Upload Modal Component
function CSVUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [accountType, setAccountType] = useState('');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const { data } = await API.post('/csv/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreview(data);
    } catch (error) {
      alert('Error processing CSV: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    if (!accountType) {
      alert('Please select an account type (Checking or Savings) before importing.');
      return;
    }

    setImporting(true);
    try {
      const { data } = await API.post('/csv/import', {
        transactions: preview.data,
        accountType
      });

      alert(`Successfully imported ${data.imported} transactions!`);
      onSuccess();
    } catch (error) {
      alert('Error importing: ' + (error.response?.data?.message || error.message));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-benji-paper dark:bg-benji-vault-card rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-benji-forest dark:text-benji-mist">Import CSV Transactions</h2>
          <button onClick={onClose} className="text-benji-ink/70 dark:text-benji-mist-dim/70 hover:text-benji-forest dark:hover:text-benji-mist text-2xl">
            ×
          </button>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-benji-forest dark:text-benji-mist mb-2">
            Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-benji-ink/70 dark:text-benji-mist-dim/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-benji-sage/20 dark:file:bg-benji-gold/20 file:text-benji-sage-dark dark:file:text-benji-gold hover:file:bg-benji-sage/30 dark:hover:file:bg-benji-gold/30"
          />
          <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70 mt-1">
            Supported format: Midfirst Bank CSV (Date, Transaction Type, Description, Debits, Credits, Balance)
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-benji-forest dark:text-benji-mist mb-2">
            This statement is for:
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setAccountType('checking')}
              className={`flex-1 p-4 rounded-lg border-2 transition text-left ${
                accountType === 'checking'
                  ? 'border-benji-sage dark:border-benji-gold bg-benji-sage/10 dark:bg-benji-gold/10'
                  : 'border-benji-sage/20 dark:border-benji-gold/10 bg-benji-cream/50 dark:bg-benji-vault-up'
              }`}
            >
              <div className="font-semibold text-benji-forest dark:text-benji-mist">Checking Account</div>
              <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70 mt-1">Day-to-day spending, bills, and deposits</p>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('savings')}
              className={`flex-1 p-4 rounded-lg border-2 transition text-left ${
                accountType === 'savings'
                  ? 'border-benji-sage dark:border-benji-gold bg-benji-sage/10 dark:bg-benji-gold/10'
                  : 'border-benji-sage/20 dark:border-benji-gold/10 bg-benji-cream/50 dark:bg-benji-vault-up'
              }`}
            >
              <div className="font-semibold text-benji-forest dark:text-benji-mist">Savings Account</div>
              <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70 mt-1">Transfers, interest, and savings goals</p>
            </button>
          </div>
          {!accountType && preview && (
            <p className="text-xs text-benji-brick dark:text-benji-coral mt-1">Please select an account type before importing</p>
          )}
        </div>

        {/* Loading */}
        {uploading && (
          <div className="text-center py-8">
            <p className="text-benji-ink dark:text-benji-mist-dim">Processing CSV file...</p>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div>
            <h3 className="text-lg font-semibold text-benji-forest dark:text-benji-mist mb-3">
              Preview ({preview.count} transactions found)
            </h3>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-benji-sage/10 dark:divide-benji-gold/10">
                <thead className="bg-benji-cream/50 dark:bg-benji-vault-up">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-benji-ink dark:text-benji-mist-dim">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-benji-paper dark:bg-benji-vault-card divide-y divide-benji-sage/10 dark:divide-benji-gold/10">
                  {preview.preview.map((trans, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-benji-forest dark:text-benji-mist">
                        {new Date(trans.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 text-xs rounded ${
                          trans.type === 'income' 
                            ? 'bg-benji-sage/15 dark:bg-benji-jade/15 text-benji-moss dark:text-benji-jade' 
                            : 'bg-benji-brick/15 dark:bg-benji-coral/15 text-benji-brick dark:text-benji-coral'
                        }`}>
                          {trans.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-benji-forest dark:text-benji-mist">{trans.category}</td>
                      <td className="px-4 py-2 text-sm text-benji-forest dark:text-benji-mist">{trans.description}</td>
                      <td className={`px-4 py-2 text-sm font-semibold ${
                        trans.type === 'income' 
                          ? 'text-benji-moss dark:text-benji-jade' 
                          : 'text-benji-brick dark:text-benji-coral'
                      }`}>
                        {trans.type === 'income' ? '+' : '-'}${trans.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.count > 10 && (
              <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70 mb-4">
                Showing first 10 of {preview.count} transactions
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg hover:bg-benji-cream dark:hover:bg-benji-vault-up text-benji-forest dark:text-benji-mist transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !accountType}
                className="px-4 py-2 bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-jade-dim dark:hover:bg-benji-jade text-white rounded-lg disabled:bg-benji-ink/30 transition-colors"
              >
                {importing ? 'Importing...' : `Import ${preview.count} Transactions`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}