const { parse, parseAmount, parseDate } = require('../csvRowParser');

describe('csvRowParser', () => {
  describe('parseAmount', () => {
    it('should parse US format with $ and commas', () => {
      expect(parseAmount('$1,234.56')).toBe(1234.56);
      expect(parseAmount('-$50.00')).toBe(-50);
      expect(parseAmount('5.50')).toBe(5.5);
    });

    it('should handle empty and invalid', () => {
      expect(parseAmount('')).toBeNaN();
      expect(parseAmount(null)).toBeNaN();
    });
  });

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD', () => {
      const d = parseDate('2025-01-15');
      expect(d).toBeInstanceOf(Date);
      expect(d.getFullYear()).toBe(2025);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(15);
    });

    it('should parse MM/DD/YYYY', () => {
      const d = parseDate('01/15/2025');
      expect(d).toBeInstanceOf(Date);
      expect(d.getFullYear()).toBe(2025);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(15);
    });

    it('should parse 2-digit year', () => {
      const d = parseDate('01/15/25');
      expect(d.getFullYear()).toBe(2025);
    });

    it('should return null for invalid date', () => {
      expect(parseDate('invalid')).toBeNull();
      expect(parseDate('')).toBeNull();
    });
  });

  describe('parse - Chase/BofA format (single Amount)', () => {
    const columnMap = { date: 'Date', amount: 'Amount', description: 'Description' };

    it('should parse expense (negative amount)', () => {
      const row = { 'Date': '01/15/2025', 'Description': 'STARBUCKS', 'Amount': '-5.50' };
      const result = parse(row, columnMap);
      expect(result).not.toBeNull();
      expect(result.type).toBe('expense');
      expect(result.amount).toBe(5.5);
      expect(result.description).toContain('STARBUCKS');
      expect(result.date).toBeInstanceOf(Date);
    });

    it('should parse income (positive amount)', () => {
      const row = { 'Date': '01/20/2025', 'Description': 'PAYROLL DEPOSIT', 'Amount': '2500.00' };
      const result = parse(row, columnMap);
      expect(result).not.toBeNull();
      expect(result.type).toBe('income');
      expect(result.amount).toBe(2500);
    });
  });

  describe('parse - Midfirst format (Debits/Credits)', () => {
    const columnMap = {
      date: 'Date',
      description: 'Description',
      debit: 'Debits(-)',
      credit: 'Credits(+)',
      balance: 'Balance',
      check: 'Check#',
      transactionType: 'Transaction Type'
    };

    it('should parse debit row', () => {
      const row = {
        'Date': '01/15/2025',
        'Transaction Type': 'DEBIT',
        'Description': 'AMAZON',
        'Debits(-)': '$25.99',
        'Credits(+)': '',
        'Balance': '$1,234.56',
        'Check#': ''
      };
      const result = parse(row, columnMap);
      expect(result).not.toBeNull();
      expect(result.type).toBe('expense');
      expect(result.amount).toBe(25.99);
      expect(result.csvData.balance).toBe(1234.56);
    });

    it('should parse credit row', () => {
      const row = {
        'Date': '01/20/2025',
        'Transaction Type': 'CREDIT',
        'Description': 'DIRECT DEP',
        'Debits(-)': '',
        'Credits(+)': '500.00',
        'Balance': '$1,500.00',
        'Check#': ''
      };
      const result = parse(row, columnMap);
      expect(result).not.toBeNull();
      expect(result.type).toBe('income');
      expect(result.amount).toBe(500);
    });

    it('should skip HOLD transactions', () => {
      const row = {
        'Date': '01/15/2025',
        'Transaction Type': 'HOLD',
        'Description': 'PENDING',
        'Debits(-)': '$10.00',
        'Credits(+)': '',
        'Balance': '',
        'Check#': ''
      };
      const result = parse(row, columnMap);
      expect(result).toBeNull();
    });
  });

  describe('parse - Wells Fargo format (Withdrawal/Deposit)', () => {
    const columnMap = {
      date: 'Date',
      description: 'Description',
      debit: 'Withdrawal',
      credit: 'Deposit',
      balance: 'Balance'
    };

    it('should parse withdrawal', () => {
      const row = { 'Date': '01/15/2025', 'Description': 'WALMART', 'Withdrawal': '45.99', 'Deposit': '', 'Balance': '500' };
      const result = parse(row, columnMap);
      expect(result).not.toBeNull();
      expect(result.type).toBe('expense');
      expect(result.amount).toBe(45.99);
    });

    it('should parse deposit', () => {
      const row = { 'Date': '01/20/2025', 'Description': 'CHECK DEPOSIT', 'Withdrawal': '', 'Deposit': '200.00', 'Balance': '700' };
      const result = parse(row, columnMap);
      expect(result).not.toBeNull();
      expect(result.type).toBe('income');
      expect(result.amount).toBe(200);
    });
  });

  describe('parse - edge cases', () => {
    it('should return null for missing date', () => {
      const columnMap = { date: 'Date', amount: 'Amount', description: 'Description' };
      const row = { 'Date': '', 'Description': 'TEST', 'Amount': '-10' };
      expect(parse(row, columnMap)).toBeNull();
    });

    it('should return null for zero amount', () => {
      const columnMap = { date: 'Date', amount: 'Amount', description: 'Description' };
      const row = { 'Date': '01/15/2025', 'Description': 'TEST', 'Amount': '0' };
      expect(parse(row, columnMap)).toBeNull();
    });

    it('should return null for invalid amount', () => {
      const columnMap = { date: 'Date', amount: 'Amount', description: 'Description' };
      const row = { 'Date': '01/15/2025', 'Description': 'TEST', 'Amount': 'abc' };
      expect(parse(row, columnMap)).toBeNull();
    });
  });
});
