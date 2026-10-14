export interface AiTenderResultDTO {
  id: number;
  tenderId: string;
  tenderTitle: string | null;
  issuingEntity: string | null;
  sourceSite: string | null;
  sourceUrl: string | null;
  submissionDeadline: string | null;
  daysUntilDeadline: number | null;
  businessCategory: string | null;
  isNewCategory: boolean | null;
  matchedVia: string | null;
  matchReason: string | null;

  documentReadStatus: string | null;
  documentEntity: string | null;
  scopeOfWork: string | null;
  materialsRequired: string | null;
  quantities: string | null;
  location: string | null;
  bookletFee: string | null;
  initialInsurance: string | null;
  documentSubmitBy: string | null;
  contactInfo: string | null;
  aiDocumentRelevant: boolean | null;
  relevanceNote: string | null;

  firstReceivedAt: string;
  lastUpdatedAt: string;
}
