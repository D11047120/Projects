using System.ComponentModel.DataAnnotations;

namespace TravelBackend.Models
{
    public class QuoteHotels
    {
        public int Id { get; set; }

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
        public Quote? Quote { get; set; }
    }
}
