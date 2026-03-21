/**
 * CSV Format Detector - Auto-detect column mappings for various bank/export formats
 * Supports Chase, Bank of America, Wells Fargo, Midfirst, and generic CSV exports
 */

// Aliases for each canonical field (case-insensitive, partial match)
const COLUMN_ALIASES = {
  date: [
    'date', 'transaction date', 'posting date', 'trans date', 'post date',
    'transaction date', 'trans. date', 'posting date', 'effective date',
    'settlement date', 'value date'
  ],
  amount: [
    'amount', 'transaction amount', 'amt', 'total'
  ],
  debit: [
    'debits', 'debits(-)', 'debit', 'withdrawal', 'withdrawals',
    'withdraw', 'out', 'money out'
  ],
  credit: [
    'credits', 'credits(+)', 'credit', 'deposit', 'deposits',
    'dep', 'in', 'money in'
  ],
  description: [
    'description', 'details', 'memo', 'payee', 'merchant',
    'narrative', 'payee name', 'reference'
  ],
  balance: [
    'balance', 'running balance', 'running bal', 'available balance'
  ],
  check: [
    'check#', 'check number', 'check no', 'reference', 'ref', 'check num'
  ],
  transactionType: [
    'transaction type', 'type', 'trans type', 'trans. type', 'status'
  ]
};

/**
 * Normalize header for matching: trim, lowercase
 */
function normalizeHeader(header) {
  if (header == null || typeof header !== 'string') return '';
  return header.trim().toLowerCase();
}

/**
 * Check if a header matches any alias for a canonical field
 */
function headerMatchesAliases(header, aliases) {
  const normalized = normalizeHeader(header);
  if (!normalized) return false;
  return aliases.some(alias => {
    const a = alias.toLowerCase();
    return normalized === a || normalized.includes(a) || a.includes(normalized);
  });
}

/**
 * Detect column mapping from CSV headers
 * @param {string[]|Object} headers - Array of header names, or object with keys (from first row)
 * @returns {Object} columnMap - Maps canonical fields to actual column names, e.g. { date: 'Date', amount: 'Amount' }
 */
function detect(headers) {
  const headerList = Array.isArray(headers)
    ? headers
    : (headers && typeof headers === 'object' ? Object.keys(headers) : []);

  const columnMap = {};

  for (const header of headerList) {
    const trimmed = header && typeof header === 'string' ? header.trim() : String(header);
    if (!trimmed) continue;

    for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (columnMap[canonical]) continue; // Already mapped
      if (headerMatchesAliases(trimmed, aliases)) {
        columnMap[canonical] = header; // Use original header for row lookup
        break;
      }
    }
  }

  return columnMap;
}

/**
 * Check if columnMap has minimum required fields to parse a transaction
 * Need at least: date + (amount OR debit OR credit)
 */
function hasRequiredFields(columnMap) {
  const hasDate = !!columnMap.date;
  const hasAmount = !!columnMap.amount;
  const hasDebitOrCredit = !!columnMap.debit || !!columnMap.credit;

  return hasDate && (hasAmount || hasDebitOrCredit);
}

module.exports = {
  detect,
  hasRequiredFields,
  COLUMN_ALIASES
};
