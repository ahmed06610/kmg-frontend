export interface ClientListDTO {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  projectsCount: number;
  totalContractValue: number;
  totalCollected: number;
  totalRemaining: number;
}

export interface ClientProjectSummaryDTO {
  id: number;
  projectCode: string;
  projectType: string;
  status: string;
  contractValue: number;
  totalCollected: number;
  remainingBalance: number;
}

export interface ClientDetailsDTO extends ClientListDTO {
  address: string | null;
  createdAt: string;
  projects: ClientProjectSummaryDTO[];
}

export interface CreateClientDTO {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateClientDTO extends CreateClientDTO {
  id: number;
}
