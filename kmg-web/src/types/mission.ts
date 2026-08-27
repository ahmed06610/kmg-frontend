export interface MissionListDTO {
  id: number;
  projectId: number;
  projectCode: string;
  foremanName: string;
  startDate: string;
  endDate: string | null;
  advanceAmount: number;
  actualSpent: number;
  settlementDifference: number;
  status: string;
  totalLaborCost: number;
}

export interface MissionWorkerDTO {
  employeeId: number;
  employeeName: string;
  daysCount: number;
}

export interface MissionDetailsDTO extends MissionListDTO {
  notes: string | null;
  workers: MissionWorkerDTO[];
}

export interface MissionWorkerInputDTO {
  employeeId: number;
  daysCount: number;
}

export interface CreateMissionDTO {
  projectId: number;
  foremanEmployeeId: number;
  startDate: string;
  advanceAmount: number;
  notes?: string | null;
  workers: MissionWorkerInputDTO[];
}

export interface SettleMissionDTO {
  missionId: number;
  endDate: string;
  actualSpent: number;
  notes?: string | null;
}
