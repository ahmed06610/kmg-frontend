export interface CashBoxTransactionDTO {
  id: number;
  amountCash: number;
  amountCredit: number;
  transactionType: string;
  description: string;
  transactionDate: string;
  projectCode: string | null;
  supplierName: string | null;
  createdByEmployeeName: string;
}

export interface CashBoxDetailsDTO {
  id: number;
  totalCash: number;
  totalCredit: number;
  totalBalance: number;
  recentTransactions: CashBoxTransactionDTO[];
}
