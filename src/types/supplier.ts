export interface SupplierListDTO {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  totalPurchases: number;
  totalPaid: number;
  totalRemaining: number;
}

export interface SupplierPaymentDTO {
  id: number;
  amount: number;
  amountCash: number;
  amountCredit: number;
  paymentDate: string;
  notes: string | null;
}

export interface SupplierPurchaseDTO {
  id: number;
  materialName: string;
  quantity: number;
  unitPriceAtTime: number;
  movementDate: string;
}

export interface SupplierDetailsDTO extends SupplierListDTO {
  address: string | null;
  createdAt: string;
  payments: SupplierPaymentDTO[];
  purchases: SupplierPurchaseDTO[];
}

export interface CreateSupplierDTO {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateSupplierDTO extends CreateSupplierDTO {
  id: number;
}

export interface CreateSupplierPaymentDTO {
  supplierId: number;
  amountCash: number;
  amountCredit: number;
  paymentDate: string;
  notes?: string | null;
}
