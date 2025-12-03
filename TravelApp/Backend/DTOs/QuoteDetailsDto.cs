using System;
using System.ComponentModel.DataAnnotations;
using TravelBackend.Models;

namespace TravelBackend.DTOs
{
    public class QuoteFlightDto
    {
        [Required]
        public string FlightNumber { get; set; }
        [Required]
        public string DepartureAirport { get; set; }
        [Required]

        public string ArrivalAirport { get; set; }
        [Required]
        public DateTime DepartureTime { get; set; }
        [Required]
        public DateTime ArrivalTime { get; set; }
        [Required]
        public decimal Price { get; set; }
    }
    public class QuoteHotelDto
    {
        [Required]
        public string HotelName { get; set; }
        [Required]
        public DateTime CheckIn { get; set; }

        [Required]
        public DateTime CheckOut { get; set; }
        [Required]
        public decimal PricePerNight { get; set; }
    }

    public class CreateQuoteDto
    {
        [Required]
        public int RequestId { get; set; }

        [Required]
        public int AgencyId { get; set; }

        public List<QuoteFlightDto>? Flights { get; set; }
        public List<QuoteHotelDto>? Hotels { get; set; }
    }
    public class CreateQuoteFlightDto
    {
        [Required(ErrorMessage = "Flight number is required.")]
        public string FlightNumber { get; set; }

        [Required(ErrorMessage = "Departure airport is required.")]
        public string DepartureAirport { get; set; }

        [Required(ErrorMessage = "Arrival airport is required.")]
        public string ArrivalAirport { get; set; }

        [Required(ErrorMessage = "Departure time is required.")]
        public DateTime DepartureTime { get; set; }

        [Required(ErrorMessage = "Arrival time is required.")]
        public DateTime ArrivalTime { get; set; }

        [Required(ErrorMessage = "Price is required.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be a positive value.")]
        public decimal Price { get; set; }

        [Required]
        public int QuoteId { get; set; }
    }
    public class CreateQuoteHotelDto
    {
        [Required(ErrorMessage = "Hotel name is required.")]
        [StringLength(150, ErrorMessage = "Hotel name can't exceed 150 characters.")]
        public string HotelName { get; set; }

        [Required(ErrorMessage = "Checkin date is required.")]
        public DateTime CheckIn { get; set; }

        [Required(ErrorMessage = "Checkout date is required.")]
        public DateTime CheckOut { get; set; }

        [Required(ErrorMessage = "Price per night is required.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be a positive value.")]
        public decimal PricePerNight { get; set; }

        [Required]
        public int QuoteId { get; set; }
    }
    public class RequestDetailsDto
    {
        [Required(ErrorMessage = "Request ID is required for update.")]
        public int Id { get; set; }
        [StringLength(20)]
        public string RequestCode { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string Description { get; set; }
        public string OriginCity { get; set; }
        public string DestinationCity { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsRound { get; set; }
        public bool NeedHotel { get; set; }
        public RequestStatus Status { get; set; }
        public int? SelectedQuoteId { get; set; }
        public QuoteDetailsDto SelectedQuote { get; set; }
        public List<QuoteDetailsDto> Quotes { get; set; }
    }
    public class UpdateRequestDto
    {
        public int Id { get; set; }
        public RequestStatus Status { get; set; }
        public int? SelectedQuoteId { get; set; }
    }


    public class QuoteDetailsDto
    {
        public int Id { get; set; }
        public AgencyDto Agency { get; set; }
        public List<QuoteFlightDto> Flights { get; set; }
        public List<QuoteHotelDto> Hotels { get; set; }
    }

    public class AgencyDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}


