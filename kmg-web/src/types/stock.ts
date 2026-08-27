export interface MaterialDTO {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  minimumThreshold: number;
  isLowStock: boolean;
  lastUpdated: string;
}

export interface CreateMaterialDTO {
  name: string;
  unit: string;
  unitPrice: number;
  minimumThreshold: number;
  initialQuantity: number;
}

export interface UpdateMaterialDTO {
  id: number;
  name: string;
  unit: string;
  unitPrice: number;
  minimumThreshold: number;
}

export interface StockMovementDTO {
  id: number;
  movementType: string;
  materialId: number;
  materialName: string;
  quantity: number;
  unitPriceAtTime: number;
  projectId: number | null;
  projectCode: string | null;
  supplierId: number | null;
  supplierName: string | null;
  movementDate: string;
  notes: string | null;
  createdByEmployeeName: string;
}

export interface CreatePurchaseDTO {
  materialId: number;
  quantity: number;
  unitPrice: number;
  supplierId: number;
  notes?: string | null;
}

export interface CreateIssueDTO {
  materialId: number;
  quantity: number;
  projectId: number;
  notes?: string | null;
}

export interface CreateReturnDTO {
  materialId: number;
  quantity: number;
  projectId: number;
  notes?: string | null;
}
