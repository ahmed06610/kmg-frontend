export type InvoiceSourceType = "ProjectPayment" | "ProjectExpense" | "StockPurchase" | "StockIssue" | "SupplierPayment" | "MiscExpense";
export type InvoiceDirection = "In" | "Out";

export interface InvoiceDTO {
  sourceType: InvoiceSourceType;
  sourceId: number;
  direction: InvoiceDirection;
  amount: number;
  date: string;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
  title: string;
  notes: string | null;
  projectId: number | null;
  projectName: string | null;
  supplierId: number | null;
  supplierName: string | null;
  createdByEmployeeName: string;
}

export interface InvoiceFilter {
  page?: number;
  pageSize?: number;
  sourceType?: InvoiceSourceType;
  direction?: InvoiceDirection;
  dateFrom?: string;
  dateTo?: string;
  projectId?: number;
  supplierId?: number;
  search?: string;
}

export interface PagedResultDTO<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GeneratedInvoiceLineItemDTO {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface GeneratedInvoiceListDTO {
  id: number;
  invoiceNumber: string;
  title: string | null;
  issueDate: string;
  recipientName: string;
  total: number;
  projectName: string | null;
  showSignature: boolean;
}

export interface GeneratedInvoiceDTO {
  id: number;
  invoiceNumber: string;
  title: string | null;
  issueDate: string;
  dueDate: string | null;
  recipientName: string;
  recipientAddress: string | null;
  recipientPhone: string | null;
  projectId: number | null;
  projectName: string | null;
  notes: string | null;
  taxPercent: number | null;
  creatorDisplayName: string | null;
  showCreatorName: boolean;
  showSignature: boolean;
  createdByEmployeeName: string;
  createdAt: string;
  lineItems: GeneratedInvoiceLineItemDTO[];
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface CreateGeneratedInvoiceLineItemDTO {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateGeneratedInvoiceDTO {
  title?: string | null;
  issueDate: string;
  dueDate?: string | null;
  recipientName: string;
  recipientAddress?: string | null;
  recipientPhone?: string | null;
  projectId?: number | null;
  notes?: string | null;
  taxPercent?: number | null;
  creatorDisplayName?: string | null;
  showCreatorName: boolean;
  showSignature: boolean;
  lineItems: CreateGeneratedInvoiceLineItemDTO[];
}
