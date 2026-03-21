const { detect, hasRequiredFields } = require('../csvFormatDetector');

describe('csvFormatDetector', () => {
  describe('detect', () => {
    it('should detect Midfirst Bank format', () => {
      const headers = ['Date', 'Transaction Type', 'Description', 'Debits(-)', 'Credits(+)', 'Balance', 'Check#'];
      const columnMap = detect(headers);
      expect(columnMap.date).toBe('Date');
      expect(columnMap.transactionType).toBe('Transaction Type');
      expect(columnMap.description).toBe('Description');
      expect(columnMap.debit).toBe('Debits(-)');
      expect(columnMap.credit).toBe('Credits(+)');
      expect(columnMap.balance).toBe('Balance');
      expect(columnMap.check).toBe('Check#');
    });

    it('should detect Chase/BofA format (Date, Description, Amount)', () => {
      const headers = ['Date', 'Description', 'Amount'];
      const columnMap = detect(headers);
      expect(columnMap.date).toBe('Date');
      expect(columnMap.description).toBe('Description');
      expect(columnMap.amount).toBe('Amount');
    });

    it('should detect Wells Fargo format (Withdrawal, Deposit)', () => {
      const headers = ['Date', 'Description', 'Withdrawal', 'Deposit', 'Balance'];
      const columnMap = detect(headers);
      expect(columnMap.date).toBe('Date');
      expect(columnMap.description).toBe('Description');
      expect(columnMap.debit).toBe('Withdrawal');
      expect(columnMap.credit).toBe('Deposit');
      expect(columnMap.balance).toBe('Balance');
    });

    it('should detect lowercase headers', () => {
      const headers = ['date', 'description', 'amount'];
      const columnMap = detect(headers);
      expect(columnMap.date).toBe('date');
      expect(columnMap.description).toBe('description');
      expect(columnMap.amount).toBe('amount');
    });

    it('should detect alternative column names', () => {
      const headers = ['Posting Date', 'Details', 'Transaction Amount'];
      const columnMap = detect(headers);
      expect(columnMap.date).toBe('Posting Date');
      expect(columnMap.description).toBe('Details');
      expect(columnMap.amount).toBe('Transaction Amount');
    });

    it('should detect from object keys', () => {
      const row = { 'Date': '01/15/2025', 'Description': 'STARBUCKS', 'Amount': '-5.50' };
      const columnMap = detect(Object.keys(row));
      expect(columnMap.date).toBe('Date');
      expect(columnMap.description).toBe('Description');
      expect(columnMap.amount).toBe('Amount');
    });

    it('should return empty object for unrecognized headers', () => {
      const headers = ['Col1', 'Col2', 'Col3'];
      const columnMap = detect(headers);
      expect(Object.keys(columnMap).length).toBe(0);
    });
  });

  describe('hasRequiredFields', () => {
    it('should return true when date and amount are present', () => {
      expect(hasRequiredFields({ date: 'Date', amount: 'Amount' })).toBe(true);
    });

    it('should return true when date and debit are present', () => {
      expect(hasRequiredFields({ date: 'Date', debit: 'Debits(-)' })).toBe(true);
    });

    it('should return true when date and credit are present', () => {
      expect(hasRequiredFields({ date: 'Date', credit: 'Credits(+)' })).toBe(true);
    });

    it('should return false when date is missing', () => {
      expect(hasRequiredFields({ amount: 'Amount', description: 'Description' })).toBe(false);
    });

    it('should return false when neither amount nor debit/credit present', () => {
      expect(hasRequiredFields({ date: 'Date', description: 'Description' })).toBe(false);
    });
  });
});
