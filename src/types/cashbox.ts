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
  miscExpenseAttachmentUrl: string | null;
  miscExpenseAttachmentFileName: string | null;
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

export interface CashBoxTransactionsResultDTO extends PagedResultDTO<CashBoxTransactionDTO> {
  filteredTotalCash: number;
  filteredTotalCredit: number;
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
  amountCash: number;
  amountCredit: number;
  notes: string | null;
  category: string;
  expenseDate: string;
  createdByEmployeeName: string;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
}

export interface CreateMiscExpenseDTO {
  amountCash: number;
  amountCredit: number;
  notes?: string | null;
  category: number;
  expenseDate: string;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
}

export interface UpdateMiscExpenseDTO {
  id: number;
  amountCash: number;
  amountCredit: number;
  notes?: string | null;
  category: number;
  expenseDate: string;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
}
