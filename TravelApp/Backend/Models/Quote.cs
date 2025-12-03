using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelBackend.Models 
{
    public class Quote
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required int RequestId { get; set; } // Fk to Request
        [ForeignKey("RequestId")]
        public Request? Request { get; set; }

        [Required]
        public required int AgencyId { get; set; } // Fk to Agency
        [ForeignKey("AgencyId")]
        public Agency? Agency { get; set; }

        [Column(TypeName = "decimal(18, 2)")] // Define precisão para valores monetários
        public decimal Cost { get; set; }

        public List<QuoteFlights> Flights { get; set; }
        public List<QuoteHotels> Hotels { get; set; }

    }
}