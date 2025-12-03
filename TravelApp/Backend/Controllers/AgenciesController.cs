
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelBackend.Data;
using TravelBackend.Models;
using TravelBackend.DTOs;

namespace TravelBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgenciesController : ControllerBase
    {
        private readonly TravelDbContext _context;

        public AgenciesController(TravelDbContext context)
        {
            _context = context;
        }

        // GET: api/Agencies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Agency>>> GetAgencies()
        {
            return await _context.Agencies.ToListAsync();
        }

        // GET: api/Agencies/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Agency>> GetAgency(int id)
        {
            var agency = await _context.Agencies.FindAsync(id);

            if (agency == null)
            {
                return NotFound();
            }

            return agency;
        }

        // POST: api/Agencies
        [HttpPost]
        public async Task<ActionResult<Agency>> PostAgency(CreateAgencyDto agencyDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var agency = new Agency
            {
                Name = agencyDto.Name,
                ContactEmail = agencyDto.ContactEmail,
                PhoneNumber = agencyDto.PhoneNumber
            };

            _context.Agencies.Add(agency);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAgency), new { id = agency.Id }, agency);
        }

        private bool AgencyExists(int id)
        {
            return _context.Agencies.Any(e => e.Id == id);
        }
    }
}
