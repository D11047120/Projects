using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TravelBackend.Models
{
    public class Agency
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        public required string Name { get; set; }

        [StringLength(255)]
        public string? ContactEmail { get; set; }

        [StringLength(50)]
        public string? PhoneNumber { get; set; }

        // Nav to Quotes
        public ICollection<Quote>? Quotes { get; set; }
    }
}