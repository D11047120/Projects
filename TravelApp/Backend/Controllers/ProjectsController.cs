using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelBackend.Data;
using TravelBackend.Models;
using TravelBackend.DTOs;

namespace TravelBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly TravelDbContext _context;
        public ProjectsController(TravelDbContext ctx) { _context = ctx; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Project>> Create(Project dto)
        {
            _context.Projects.Add(dto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProjects), new { id = dto.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Project dto)
        {
            if (id != dto.Id) return BadRequest();
            _context.Entry(dto).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("import")]
        public async Task<IActionResult> Import(IFormFile file)
        {
            using var reader = new StreamReader(file.OpenReadStream());
            reader.ReadLine();
            while (!reader.EndOfStream)
            {
                var line = reader.ReadLine();
                var parts = line.Split(',');
                var p = new Project
                {
                    Code = parts[0].Trim(),
                    Name = parts[1].Trim(),
                    Budget = decimal.Parse(parts[2].Trim())
                };
                _context.Projects.Add(p);
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
