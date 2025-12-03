using System;
using System.ComponentModel.DataAnnotations;
using TravelBackend.Models;

namespace TravelBackend.DTOs
{
    public class CreateRequestDto
    {
        [Required]
        public int ProjectId { get; set; }
        [StringLength(20)]
        public string RequestCode { get; set; } = string.Empty;

        public RequestStatus Status { get; set; }
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description {get; set;}
        [Required(ErrorMessage = "Origin City is required.")]
        [StringLength(200, ErrorMessage = "Origin City cannot exceed 200 characters.")]
        public string OriginCity { get; set; } = null!;

        [Required(ErrorMessage = "Destination City is required.")]
        [StringLength(200, ErrorMessage = "Destination City cannot exceed 200 characters.")]
        public string DestinationCity { get; set; } = null!;

        [Required(ErrorMessage = "Start date is required.")]
        [DataType(DataType.Date, ErrorMessage = "Invalid date format.")]
        public required DateTime StartDate { get; set; }

        public bool IsRound { get; set; }   //false default

        [DataType(DataType.Date, ErrorMessage = "Invalid date format.")]
        public DateTime? EndDate { get; set; } // Null if IsRound is false

        public bool NeedHotel { get; set; } //false default

        [DataType(DataType.Date, ErrorMessage = "Invalid date format.")]
        public DateTime? CheckInDate { get; set; } // Null if NeedHotel is false

        [DataType(DataType.Date, ErrorMessage = "Invalid date format.")]
        public DateTime? CheckOutDate { get; set; } // Null if NeedHotel is flase
    }
}