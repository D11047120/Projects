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
    public class QuotesController : ControllerBase
    {
        private readonly TravelDbContext _context;

        public QuotesController(TravelDbContext context)
        {
            _context = context;
        }

        // POST: api/quotes
        [HttpPost]
        public async Task<ActionResult<Quote>> CreateQuote([FromBody] CreateQuoteDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var quote = new Quote
            {
                RequestId = dto.RequestId,
                AgencyId = dto.AgencyId,
                Flights = dto.Flights?.Select(f => new QuoteFlights
                {
                    FlightNumber = f.FlightNumber,
                    DepartureAirport = f.DepartureAirport,
                    ArrivalAirport = f.ArrivalAirport,
                    DepartureTime = f.DepartureTime,
                    ArrivalTime = f.ArrivalTime,
                    Price = f.Price
                }).ToList() ?? new List<QuoteFlights>(),

                Hotels = dto.Hotels?.Select(h => new QuoteHotels
                {
                    HotelName = h.HotelName,
                    CheckIn = h.CheckIn,
                    CheckOut = h.CheckOut,
                    PricePerNight = h.PricePerNight
                }).ToList() ?? new List<QuoteHotels>()
            };

            _context.Quotes.Add(quote);
            await _context.SaveChangesAsync();

            // Load agency (optional if you want to return full quote with agency populated)
            await _context.Entry(quote).Reference(q => q.Agency).LoadAsync();

            return CreatedAtAction(nameof(GetQuoteById), new { id = quote.Id }, quote);
        }


        // GET: api/quotes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Quote>> GetQuoteById(int id)
        {
            var quote = await _context.Quotes
                .Include(q => q.Flights)
                .Include(q => q.Hotels)
                .Include(q => q.Request)
                .Include(q => q.Agency)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quote == null)
                return NotFound();

            return Ok(quote);
        }

        // GET: api/quotes/ByRequest/{id}
        [HttpGet("ByRequest/{requestId}")]
        public async Task<ActionResult<IEnumerable<Quote>>> GetQuotesByRequest(int requestId)
        {
            var quotes = await _context.Quotes
                .Where(q => q.RequestId == requestId)
                .Include(q => q.Flights)
                .Include(q => q.Hotels)
                .Include(q => q.Agency)
                .ToListAsync();

            return Ok(quotes);
        }

        // PUT: api/quotes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuote(int id, UpdateQuoteDto dto)
        {
            var quote = await _context.Quotes
                .Include(q => q.Flights)
                .Include(q => q.Hotels)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quote == null)
                return NotFound();

            // Update fields
            quote.Cost = dto.Cost;

            // Optional: Replace child collections (or patch them as needed)
            if (dto.Flights != null)
            {
                _context.QuoteFlights.RemoveRange(quote.Flights);
                quote.Flights = dto.Flights.Select(f => new QuoteFlights
                {
                    FlightNumber = f.FlightNumber,
                    DepartureAirport = f.DepartureAirport,
                    ArrivalAirport = f.ArrivalAirport,
                    DepartureTime = f.DepartureTime,
                    ArrivalTime = f.ArrivalTime,
                    Price = f.Price,
                    QuoteId = id
                }).ToList();
            }

            if (dto.Hotels != null)
            {
                _context.QuoteHotels.RemoveRange(quote.Hotels);
                quote.Hotels = dto.Hotels.Select(h => new QuoteHotels
                {
                    HotelName = h.HotelName,
                    CheckIn = h.CheckIn,
                    CheckOut = h.CheckOut,
                    PricePerNight = h.PricePerNight,
                    QuoteId = id
                }).ToList();
            }


            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
