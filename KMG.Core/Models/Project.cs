using System.ComponentModel.DataAnnotations.Schema;
using KMG.Core.Enums;

namespace KMG.Core.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ProjectCode { get; set; } = string.Empty;
        public ProjectType ProjectType { get; set; }
        public ProjectStatus Status { get; set; }
        public string? Description { get; set; }

        public decimal ContractValue { get; set; }

        // خاص بمشاريع المناقصات (تصنيع وتنفيذ) - نسب مش قيم مطلقة، بتتحسب على قيمة العقد
        public decimal? TenderInsurancePercent { get; set; }
        public decimal? TenderTaxPercent { get; set; }
        public decimal? WorkGuaranteePercent { get; set; }

        public DateTime? InsuranceDueDate { get; set; }
        public bool InsuranceRecovered { get; set; }
        public DateTime? WorkGuaranteeDueDate { get; set; }
        public bool WorkGuaranteeRecovered { get; set; }

        // خاص بمشاريع التوريد
        public decimal? SupplyProfitMargin { get; set; }

        public DateTime CreatedAt { get; set; }

        public int ClientId { get; set; }
        public virtual Client Client { get; set; } = null!;

        public int CreatedByEmployeeId { get; set; }
        public virtual Employee CreatedByEmployee { get; set; } = null!;

        public virtual ICollection<ProjectPayment> Payments { get; set; } = new List<ProjectPayment>();
        public virtual ICollection<ProjectExpense> Expenses { get; set; } = new List<ProjectExpense>();
        public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
        public virtual ICollection<Mission> Missions { get; set; } = new List<Mission>();
        public virtual ICollection<ProjectAttachment> Attachments { get; set; } = new List<ProjectAttachment>();
        public virtual ICollection<ProjectAudit> AuditLogs { get; set; } = new List<ProjectAudit>();
        public virtual ICollection<ProjectWriteOff> WriteOffs { get; set; } = new List<ProjectWriteOff>();
        public virtual ICollection<CashBoxTransaction> CashBoxTransactions { get; set; } = new List<CashBoxTransaction>();

        // تكلفة الخامات = (صرف للمشروع - مرتجع من المشروع) بسعر وقت الحركة
        [NotMapped]
        public decimal TotalMaterialsCost =>
            StockMovements.Where(m => m.MovementType == MovementType.IssueToProject).Sum(m => m.Quantity * m.UnitPriceAtTime)
            - StockMovements.Where(m => m.MovementType == MovementType.ReturnFromProject).Sum(m => m.Quantity * m.UnitPriceAtTime);

        [NotMapped]
        public decimal TotalPettyExpenses => Expenses.Sum(e => e.Amount);

        [NotMapped]
        public decimal TotalLaborCost => Missions.Sum(m => m.TotalLaborCost);

        [NotMapped]
        public decimal TotalCollected => Payments.Sum(p => p.Amount);

        [NotMapped]
        public decimal TotalWriteOffs => WriteOffs.Sum(w => w.Amount);

        [NotMapped]
        public decimal TenderInsuranceAmount => TenderInsurancePercent is > 0 ? ContractValue * TenderInsurancePercent.Value / 100m : 0;

        [NotMapped]
        public decimal TenderTaxAmount => TenderTaxPercent is > 0 ? ContractValue * TenderTaxPercent.Value / 100m : 0;

        [NotMapped]
        public decimal WorkGuaranteeAmount => WorkGuaranteePercent is > 0 ? ContractValue * WorkGuaranteePercent.Value / 100m : 0;

        // الضريبة بتزود المبلغ المطلوب تحصيله فعليًا من العميل - مش رقم عرض بس
        [NotMapped]
        public decimal ContractValueWithTax => ContractValue + TenderTaxAmount;

        [NotMapped]
        public decimal RemainingBalance => ContractValueWithTax - TotalCollected - TotalWriteOffs;

        [NotMapped]
        public decimal NetProfit => ContractValue - (TotalMaterialsCost + TotalPettyExpenses + TotalLaborCost);
    }
}
