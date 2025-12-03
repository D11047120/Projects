using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelBackend.Data;
using TravelBackend.DTOs;
using TravelBackend.Services;
using Microsoft.EntityFrameworkCore;
namespace TravelBackend.Controllers
{
 [ApiController]
 public class AuthController : ControllerBase
 {
 private readonly TravelDbContext _context;
 private readonly AuthService _service;
 public AuthController(TravelDbContext context, AuthService service)
 {
 _context = context;
 _service = service;
 }
 [HttpPost("api/authorization/token")]
 [AllowAnonymous]
 public async Task<IActionResult> GetTokenAsync([FromBody] GetTokenRequest request)
 {
 var user = await _context.Users.Where(o => o.Username == request.UserName).FirstAsync();
 if (user == null)
 return Unauthorized(); 
 var passwordValid = user.CheckPasswordAsync(request.Password);
 if (!passwordValid)
 return Unauthorized(); 
 return Ok(_service.Create(user));
 }
 }
}
