using Microsoft.IdentityModel.Tokens ;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TravelBackend.Models;

namespace TravelBackend.Services
{
 public class AuthService
 {
    private readonly IConfiguration _configuration;
    public AuthService(IConfiguration configuration)
    {
    _configuration = configuration;
    }
    public string Create(User user)
    {
    var handler = new JwtSecurityTokenHandler();

    var privateKey = Encoding.UTF8.GetBytes(_configuration.GetValue<string>("PrivateKey"));
    var credentials = new SigningCredentials(
                      new SymmetricSecurityKey(privateKey),
                      SecurityAlgorithms.HmacSha256);
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        SigningCredentials = credentials,
        Expires = DateTime.UtcNow.AddHours(1),
        Subject = GenerateClaims(user)
    };
    var token = handler.CreateToken(tokenDescriptor);
    return handler.WriteToken(token);
 }

    private static ClaimsIdentity GenerateClaims(User user)
    {
        var ci = new ClaimsIdentity();
        ci.AddClaim(new Claim("id", user.Id.ToString()));
        ci.AddClaim(new Claim(ClaimTypes.Email, user.Username));
        ci.AddClaim(new Claim(ClaimTypes.GivenName, user.Name));
        ci.AddClaim(new Claim(ClaimTypes.Role, user.Role));
        
        return ci;
    }
 }
}
