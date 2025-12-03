using System.ComponentModel.DataAnnotations;
using System;

namespace TravelBackend.DTOs
{
    public class UpdateQuoteDto
    {
        [Range(0.01, double.MaxValue, ErrorMessage = "Cost must be a positive value if provided.")]
        public decimal Cost { get; set; }

        public List<QuoteFlightDto> Flights { get; set; }
        public List<QuoteHotelDto> Hotels { get; set; }
    }
}
