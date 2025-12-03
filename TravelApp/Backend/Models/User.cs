using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography;
using System.Text;

namespace TravelBackend.Models
{

    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public required string Name { get; set; }

        [MaxLength(254)]
        public string Username { get; set; } = "";

        [Required]
        [MaxLength(1024)]
        public string PasswordHash { get; set; } = "";

        [Required]
        public string Role { get; set; }
        public ICollection<Request>? Requests { get; set; }

        private const string SALT = "AsArmasEOsBarõesAssinalados";
        public bool CheckPasswordAsync(string password)
        {
            var hash = this.GeneratePassHash(password);
            return PasswordHash.Equals(hash);
        }
        public string GeneratePassHash(string password)
        {
            using (SHA512 sha512 = SHA512.Create())
            {
                var sSourceData = this.Username + SALT + password;
                byte[] tmpSource = Encoding.UTF8.GetBytes(sSourceData);
                //Compute hash based on source data
                byte[] tmpHash = sha512.ComputeHash(tmpSource);

                return System.Text.Encoding.UTF8.GetString(tmpHash);
            }
        }

    }
}