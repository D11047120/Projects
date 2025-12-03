using System.ComponentModel.DataAnnotations;

namespace TravelBackend.DTOs 
{
    public class CreateAgencyDto
    {
        [Required(ErrorMessage = "Agency name is required.")]
        [StringLength(50, ErrorMessage = "Agency name cannot exceed 50 characters.")] 
        public required string Name { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format.")] 
        [StringLength(100, ErrorMessage = "Contact email cannot exceed 100 characters.")]
        public string? ContactEmail { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(50, ErrorMessage = "Phone number cannot exceed 50 characters.")]
        public string? PhoneNumber { get; set; }
    }
}