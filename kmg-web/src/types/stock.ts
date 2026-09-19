export interface MaterialDTO {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  minimumThreshold: number;
  isLowStock: boolean;
  lastUpdated: string;
  totalPrice: number;
  categoryId: number | null;
  categoryName: string | null;
  extraFieldValues: Record<string, string>;
}

export interface CreateMaterialDTO {
  name: string;
  unit: string;
  unitPrice: number;
  minimumThreshold: number;
  initialQuantity: number;
  categoryId?: number | null;
  extraFieldValues?: Record<string, string>;
}

export interface UpdateMaterialDTO {
  id: number;
  name: string;
  unit: string;
  unitPrice: number;
  minimumThreshold: number;
  categoryId?: number | null;
  extraFieldValues?: Record<string, string>;
}

export interface CategoryFieldDefinitionDTO {
  key: string;
  label: string;
  fieldType: string;
}

export interface MaterialCategoryDTO {
  id: number;
  name: string;
  extraFieldDefinitions: CategoryFieldDefinitionDTO[];
  materialsCount: number;
}

export interface CreateMaterialCategoryDTO {
  name: string;
  extraFieldDefinitions: CategoryFieldDefinitionDTO[];
}

export interface UpdateMaterialCategoryDTO {
  id: number;
  name: string;
  extraFieldDefinitions: CategoryFieldDefinitionDTO[];
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
  projectName: string | null;
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
