export interface CashBoxTransactionDTO {
  id: number;
  amountCash: number;
  amountCredit: number;
  transactionType: string;
  description: string;
  transactionDate: string;
  projectCode: string | null;
  projectName: string | null;
  supplierName: string | null;
  createdByEmployeeName: string;
  miscExpenseId: number | null;
  miscExpenseNotes: string | null;
  miscExpenseCategory: string | null;
  miscExpenseDate: string | null;
}

export interface CashBoxDetailsDTO {
  id: number;
  totalCash: number;
  totalCredit: number;
  totalBalance: number;
  recentTransactions: CashBoxTransactionDTO[];
}

export interface PagedResultDTO<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CashBoxTransactionFilter {
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  type?: number;
  isIn?: boolean;
  search?: string;
}

export interface MiscExpenseDTO {
  id: number;
  amount: number;
  notes: string | null;
  category: string;
  expenseDate: string;
  createdByEmployeeName: string;
}

export interface CreateMiscExpenseDTO {
  amount: number;
  notes?: string | null;
  category: number;
  expenseDate: string;
}

export interface UpdateMiscExpenseDTO {
  id: number;
  amount: number;
  notes?: string | null;
  category: number;
  expenseDate: string;
}
