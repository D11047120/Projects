using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelBackend.Data;
using TravelBackend.Models;
using TravelBackend.DTOs;

[ApiController]
[Route("api/[controller]")]
public class QuoteHotelsController : ControllerBase
{
    private readonly TravelDbContext _context;

    public QuoteHotelsController(TravelDbContext context)
    {
        _context = context;
    }

    // POST: api/QuoteHotels
    [HttpPost]
    public async Task<ActionResult<QuoteHotels>> CreateHotel([FromBody] CreateQuoteHotelDto dto)
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


        var hotel = new QuoteHotels
        {
            HotelName = dto.HotelName,
            CheckIn = DateTime.SpecifyKind(dto.CheckIn, DateTimeKind.Utc),
            CheckOut = DateTime.SpecifyKind(dto.CheckOut, DateTimeKind.Utc),
            PricePerNight = dto.PricePerNight,
            QuoteId = dto.QuoteId
        };
         _context.QuoteHotels.Add(hotel);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHotel), new { id = hotel.Id }, hotel);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuoteHotels>> GetHotel(int id)
    {
        var hotel = await _context.QuoteHotels.FindAsync(id);
        if (hotel == null)
            return NotFound();

        return hotel;
    }
    // PUT
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHotel(int id, [FromBody] QuoteHotels updatedHotel)
    {
        if (id != updatedHotel.Id)
            return BadRequest("ID mismatch.");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _context.Entry(updatedHotel).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.QuoteHotels.Any(h => h.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    // DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHotel(int id)
    {
        var hotel = await _context.QuoteHotels.FindAsync(id);
        if (hotel == null)
            return NotFound();

        _context.QuoteHotels.Remove(hotel);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
