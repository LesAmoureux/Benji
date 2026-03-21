/**
 * CSV Row Parser - Parse a single CSV row using column mapping
 * Handles multiple date formats, amount styles (single Amount vs Debits/Credits), and number formats
 */

const { detectCategory, extractMerchantName } = require('./categoryDetector');

/**
 * Get value from row by column name (handles case variations)
 */
function getValue(row, columnName) {
  if (!columnName || !row) return null;
  if (row[columnName] !== undefined && row[columnName] !== null && row[columnName] !== '') {
    return String(row[columnName]).trim();
  }
  // Try case-insensitive match for headers with different casing
  const lower = columnName.toLowerCase();
  for (const key of Object.keys(row)) {
    if (key.toLowerCase() === lower) {
      const val = row[key];
      return (val !== undefined && val !== null && val !== '') ? String(val).trim() : null;
    }
  }
  return null;
}

/**
 * Parse amount from string - strip $, commas, handle European format
 */
function parseAmount(str) {
  if (!str || typeof str !== 'string') return NaN;
  let cleaned = str.replace(/\$/g, '').replace(/\s/g, '');
  // European: 1.234,56 -> 1234.56
  if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    cleaned = cleaned.replace(/,/g, '');
  }
  return parseFloat(cleaned);
}

/**
 * Parse date from string - try multiple formats
 */
function parseDate(str) {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  // YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const d = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  // Slash-separated: MM/DD/YYYY or DD/MM/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    let year = slashMatch[3];
    if (year.length === 2) year = '20' + year;
    const a = parseInt(slashMatch[1]);
    const b = parseInt(slashMatch[2]);
    let d;
    if (a > 12) {
      d = new Date(parseInt(year), b - 1, a);
    } else if (b > 12) {
      d = new Date(parseInt(year), a - 1, b);
    } else {
      d = new Date(parseInt(year), a - 1, b);
    }
    return isNaN(d.getTime()) ? null : d;
  }

  // Dash-separated: MM-DD-YYYY or DD-MM-YYYY
  const dashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dashMatch) {
    let year = dashMatch[3];
    if (year.length === 2) year = '20' + year;
    const a = parseInt(dashMatch[1]);
    const b = parseInt(dashMatch[2]);
    let d;
    if (a > 12) {
      d = new Date(parseInt(year), b - 1, a);
    } else if (b > 12) {
      d = new Date(parseInt(year), a - 1, b);
    } else {
      d = new Date(parseInt(year), a - 1, b);
    }
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback: native Date parse
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Parse a single CSV row into normalized transaction format
 * @param {Object} row - Raw row from csv-parser (keys = header names)
 * @param {Object} columnMap - From csvFormatDetector.detect(), maps canonical -> header name
 * @returns {Object|null} Normalized transaction or null if unparseable
 */
function parse(row, columnMap) {
  try {
    const dateStr = getValue(row, columnMap.date);
    if (!dateStr) return null;

    const transType = getValue(row, columnMap.transactionType);
    if (transType && transType.toUpperCase() === 'HOLD') return null;

    const description = getValue(row, columnMap.description) || '';

    let amount = 0;
    let type = 'expense';

    // 1. Single Amount column (Chase, BofA): negative = expense, positive = income
    const amountStr = getValue(row, columnMap.amount);
    if (amountStr) {
      const parsed = parseAmount(amountStr);
      if (!isNaN(parsed) && parsed !== 0) {
        amount = Math.abs(parsed);
        type = parsed < 0 ? 'expense' : 'income';
      }
    }

    // 2. Debits + Credits (Midfirst, Wells Fargo)
    if (amount === 0) {
      const debitStr = getValue(row, columnMap.debit);
      const creditStr = getValue(row, columnMap.credit);

      if (debitStr) {
        amount = parseAmount(debitStr);
        type = 'expense';
      } else if (creditStr) {
        amount = parseAmount(creditStr);
        type = 'income';
      }
    }

    if (amount === 0 || isNaN(amount)) return null;

    const parsedDate = parseDate(dateStr);
    if (!parsedDate) return null;

    const balanceStr = getValue(row, columnMap.balance);
    const checkNum = getValue(row, columnMap.check);

    const merchantName = extractMerchantName(description);
    const category = detectCategory(description);

    return {
      type,
      category,
      amount,
      description: merchantName || description || '',
      merchantName: merchantName || description || '',
      originalDescription: description,
      date: parsedDate,
      csvData: {
        checkNumber: checkNum || '',
        transactionType: transType || '',
        balance: balanceStr ? parseAmount(balanceStr) : null
      }
    };
  } catch (error) {
    return null;
  }
}

module.exports = {
  parse,
  parseAmount,
  parseDate,
  getValue
};
