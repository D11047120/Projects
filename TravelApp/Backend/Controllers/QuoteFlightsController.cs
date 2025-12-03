using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelBackend.Data;
using TravelBackend.Models;
using TravelBackend.DTOs;

[ApiController]
[Route("api/[controller]")]
public class QuoteFlightsController : ControllerBase
{
    private readonly TravelDbContext _context;

    public QuoteFlightsController(TravelDbContext context)
    {
        _context = context;
    }

    // POST: api/QuoteFlights
    [HttpPost]
    public async Task<ActionResult<QuoteFlights>> CreateFlight([FromBody] CreateQuoteFlightDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(new { Errors = errors });
        }

        var quoteExists = await _context.Quotes.AnyAsync(q => q.Id == dto.QuoteId);
        if (!quoteExists)
        {
            return BadRequest(new { Errors = new[] { $"Quote with ID {dto.QuoteId} does not exist." } });
        }

        var flight = new QuoteFlights
        {
            FlightNumber = dto.FlightNumber,
            DepartureAirport = dto.DepartureAirport,
            ArrivalAirport = dto.ArrivalAirport,
            DepartureTime = DateTime.SpecifyKind(dto.DepartureTime, DateTimeKind.Utc),
            ArrivalTime = DateTime.SpecifyKind(dto.ArrivalTime, DateTimeKind.Utc),
            Price = dto.Price,
            QuoteId = dto.QuoteId
        };

        _context.QuoteFlights.Add(flight);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFlight), new { id = flight.Id }, flight);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuoteFlights>> GetFlight(int id)
    {
        var flight = await _context.QuoteFlights.FindAsync(id);
        if (flight == null)
            return NotFound();

        return flight;
    }
    // PUT
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFlight(int id, [FromBody] QuoteFlights updatedFlight)
    {
        if (id != updatedFlight.Id)
            return BadRequest("ID mismatch.");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _context.Entry(updatedFlight).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.QuoteFlights.Any(f => f.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    // DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFlight(int id)
    {
        var flight = await _context.QuoteFlights.FindAsync(id);
        if (flight == null)
            return NotFound();

        _context.QuoteFlights.Remove(flight);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

