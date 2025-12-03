using System.ComponentModel.DataAnnotations;
namespace TravelBackend.Models
{
    public class QuoteFlights
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Flight number is required.")]
        [StringLength(20, ErrorMessage = "Flight number can't exceed 20 characters.")]
        public string FlightNumber { get; set; }

        [Required(ErrorMessage = "Departure airport is required.")]
        public string DepartureAirport { get; set; }

        [Required(ErrorMessage = "Arrival airport is required.")]
        public string ArrivalAirport { get; set; }

        [Required(ErrorMessage = "Departure time is required.")]
        [DataType(DataType.DateTime)]
        public DateTime DepartureTime { get; set; }

        [Required(ErrorMessage = "Arrival time is required.")]
        [DataType(DataType.DateTime)]
        public DateTime ArrivalTime { get; set; }

        [Required(ErrorMessage = "Flight price is required.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be a positive value.")]
        public decimal Price { get; set; }

        [Required]
        public int QuoteId { get; set; }
        public Quote? Quote { get; set; }
    }
}
