const Transaction = require('../models/Transaction');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { detect } = require('../utils/csvFormatDetector');
const { parse: parseCSVRow } = require('../utils/csvRowParser');

/**
 * Strip BOM from start of file content
 */
function stripBOM(content) {
  if (typeof content !== 'string') return content;
  return content.replace(/^\uFEFF/, '');
}

/**
 * Detect delimiter from first line (comma vs semicolon)
 */
function detectDelimiter(content) {
  const firstLine = content.split(/\r?\n/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ';' : ',';
}

// Parse CSV and return preview
exports.previewCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    let fileContent = req.file.buffer.toString('utf-8');
    fileContent = stripBOM(fileContent);
    const delimiter = detectDelimiter(fileContent);

    const results = [];
    const parseErrors = [];
    let columnMap = null;
    let rowIndex = 0;

    const stream = Readable.from([fileContent]);

    const parser = stream.pipe(csv({
      separator: delimiter,
      mapHeaders: ({ header }) => (header || '').trim(),
      mapValues: ({ value }) => (value != null ? String(value).trim() : '')
    }));

    parser.on('headers', (headers) => {
      columnMap = detect(headers);
    });

    parser.on('data', (row) => {
      rowIndex++;
      if (!columnMap || Object.keys(columnMap).length === 0) {
        parseErrors.push({ row: rowIndex, raw: JSON.stringify(row).slice(0, 100), error: 'Could not detect column mapping' });
        return;
      }

      try {
        const parsedRow = parseCSVRow(row, columnMap);
        if (parsedRow) {
          results.push(parsedRow);
        }
      } catch (err) {
        parseErrors.push({ row: rowIndex, raw: JSON.stringify(row).slice(0, 100), error: err.message });
      }
    });

    parser.on('end', () => {
      results.sort((a, b) => new Date(a.date) - new Date(b.date));

      const response = {
        success: true,
        count: results.length,
        preview: results.slice(0, 10),
        data: results
      };

      if (parseErrors.length > 0) {
        response.parseErrors = parseErrors.slice(0, 20);
      }
      if (columnMap && Object.keys(columnMap).length > 0) {
        response.columnMap = columnMap;
      }

      res.json(response);
    });

    parser.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: 'Error parsing CSV: ' + error.message
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Import CSV transactions
exports.importCSV = async (req, res) => {
  try {
    console.log('=== CSV IMPORT STARTED ===');
    console.log('User:', req.user);
    console.log('User ID:', req.user?._id);
    console.log('Transactions count:', req.body.transactions?.length);

    // Verify user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { transactions, accountType } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transactions data'
      });
    }

    if (!accountType || !['checking', 'savings'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: 'Please specify accountType as "checking" or "savings"'
      });
    }

    const importedTransactions = [];
    const errors = [];

    console.log('Processing transactions...');

    for (let i = 0; i < transactions.length; i++) {
      const trans = transactions[i];

      try {
        // Validate required fields
        if (!trans.type || !trans.category || trans.amount === undefined || !trans.date) {
          errors.push({
            row: i + 1,
            description: trans.description || 'Unknown',
            error: 'Missing required fields'
          });
          continue;
        }

        // Create transaction with proper user ID
        const transaction = await Transaction.create({
          user: req.user._id,
          type: trans.type,
          category: trans.category,
          amount: Math.abs(parseFloat(trans.amount)),
          description: trans.description || '',
          merchantName: trans.merchantName || '',
          originalDescription: trans.originalDescription || '',
          date: new Date(trans.date),
          accountType,
          importedFrom: 'csv',
          csvData: {
            checkNumber: trans.csvData?.checkNumber || '',
            transactionType: trans.csvData?.transactionType || '',
            balance: trans.csvData?.balance != null ? trans.csvData.balance : null
          }
        });

        importedTransactions.push(transaction);

        // Log progress every 50 transactions
        if ((i + 1) % 50 === 0) {
          console.log(`Processed ${i + 1}/${transactions.length} transactions`);
        }
      } catch (err) {
        console.error(`Error importing transaction ${i + 1}:`, err.message);
        errors.push({
          row: i + 1,
          description: trans.description || 'Unknown',
          error: err.message
        });
      }
    }

    console.log('=== CSV IMPORT COMPLETED ===');
    console.log(`Imported: ${importedTransactions.length}`);
    console.log(`Failed: ${errors.length}`);

    res.json({
      success: true,
      imported: importedTransactions.length,
      failed: errors.length,
      data: importedTransactions,
      errors: errors.length > 0 ? errors.slice(0, 10) : []
    });
  } catch (error) {
    console.error('=== CSV IMPORT ERROR ===');
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete all CSV imported transactions
exports.deleteAllCSVTransactions = async (req, res) => {
  try {
    console.log('=== DELETE CSV IMPORTS STARTED ===');
    console.log('User:', req.user._id);

    const result = await Transaction.deleteMany({
      user: req.user._id,
      importedFrom: 'csv'
    });

    console.log(`Deleted ${result.deletedCount} CSV transactions`);

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} CSV imported transactions`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('=== DELETE CSV ERROR ===');
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
