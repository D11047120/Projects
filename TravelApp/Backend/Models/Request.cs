using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelBackend.Models
{
    public enum RequestStatus
    {
        [Display(Name = "Draft")]  
        Draft = 0,          // Guarda request nao enviado
        [Display(Name = "Submitted")]  
        Submitted = 1,      // Guarda request enviado
        [Display(Name = "Waiting for Quotes")]  
        WaitingQuotes = 2,        // Aguardando quotes da agency
        [Display(Name = "Waiting for Selection")]  
        WaitingSelection = 3,      // Aguardando Selecao do traveler
        [Display(Name = "Waiting for Approval")]  
        WaitingApproval = 4,     // Aguardando aprovacao do manager
        [Display(Name = "Approved")]  
        Approved = 5,       // aprovado
        [Display(Name = "Rejected")]  
        Rejected = 6,       // rejeitado
        [Display(Name = "Canceled")]  
        Canceled = 7        // cancelado
    }

    public class Request
    {
        [Key]
        public int Id { get; set; }
        [StringLength(20)]
        public string RequestCode { get; set; } = string.Empty;

        [Required]
        public required int TravelerId { get; set; } // FKey to User
    
        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public Project Project { get; set; }
        [StringLength(500)]
        public string Description {get; set;}

        [Required]
        [StringLength(200)]
        public required string OriginCity { get; set; }

        [Required]
        [StringLength(200)]
        public required string DestinationCity { get; set; }

        [Required]
        [StringLength(200)]
        public required DateTime StartDate { get; set; }

        public bool IsRound { get; set; }
        public DateTime? EndDate { get; set; }

        public bool NeedHotel { get; set; }
        public DateTime? CheckInDate { get; set; }

        public DateTime? CheckOutDate { get; set; }

        public RequestStatus Status { get; set; } 

        public int? SelectedQuoteId { get; set; }

        [ForeignKey("SelectedQuoteId")]
        public Quote? SelectedQuote { get; set; }   

        public ICollection<Quote>? Quotes { get; set; }
    }
}