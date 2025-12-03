using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelBackend.Data;
using TravelBackend.DTOs;
using TravelBackend.Models;
using System.Text.Json.Serialization;

namespace TravelBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestsController : ControllerBase
    {
        private readonly TravelDbContext _context;

        public RequestsController(TravelDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Request>> PostRequest(CreateRequestDto requestDto)
        {
            const int hardcodedTravelerId = 1;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (requestDto.IsRound && !requestDto.EndDate.HasValue)
            {
                ModelState.AddModelError(nameof(requestDto.EndDate), "End date is required for a round trip.");
                return BadRequest(ModelState);
            }

            if (requestDto.IsRound && requestDto.EndDate < requestDto.StartDate)
            {
                ModelState.AddModelError(nameof(requestDto.EndDate), "End date cannot be before start date.");
                return BadRequest(ModelState);
            }

            if (requestDto.NeedHotel && (!requestDto.CheckInDate.HasValue || !requestDto.CheckOutDate.HasValue))
            {
                ModelState.AddModelError(nameof(requestDto.CheckInDate), "Check-in and Check-out dates are required when a hotel is needed.");
                return BadRequest(ModelState);
            }

            if (requestDto.NeedHotel && requestDto.CheckInDate < requestDto.StartDate)
            {
                ModelState.AddModelError(nameof(requestDto.CheckInDate), "Hotel check-in date cannot be before trip start date.");
                return BadRequest(ModelState);
            }
            
            if (requestDto.NeedHotel && requestDto.CheckOutDate < requestDto.CheckInDate)
            {
                ModelState.AddModelError(nameof(requestDto.CheckOutDate), "Hotel check-out date cannot be before check-in date.");
                return BadRequest(ModelState);
            }

            var travelerExists = await _context.Users.AnyAsync(u => u.Id == hardcodedTravelerId);
            if (!travelerExists)
            {
                return StatusCode(500, "Internal Server Error: Hardcoded Traveler ID does not exist in the database. Please ensure a user with ID 1 exists.");
            }
            // Gerar o próximo código de request
            var currentYear = DateTime.Now.Year;
            var countThisYear = await _context.Requests
                .CountAsync(r => r.StartDate.Year == currentYear);

            var nextSequence = countThisYear + 1;
            var requestCode = $"CD-{currentYear}-{nextSequence.ToString("D3")}";


            var request = new Request
            {
                TravelerId = hardcodedTravelerId,
                RequestCode = requestCode,
                ProjectId = requestDto.ProjectId,
                Description = requestDto.Description,
                OriginCity = requestDto.OriginCity,
                DestinationCity = requestDto.DestinationCity,
                StartDate = requestDto.StartDate,
                
                IsRound = requestDto.IsRound,
                EndDate = requestDto.EndDate,
                NeedHotel = requestDto.NeedHotel,
                CheckInDate = requestDto.CheckInDate,
                CheckOutDate = requestDto.CheckOutDate,

                Status = requestDto.Status,
                         
            };
            if (requestDto.Status == RequestStatus.Submitted)
            {
                request.Status = RequestStatus.Submitted;
            }
            else
            {
                request.Status = RequestStatus.Draft;
            }

            _context.Requests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
        }
        [HttpGet("manager-view")]
        public IActionResult GetRequestsForManager()
        {
            var requests = _context.Requests
                .Include(r => r.Project)
                .Include(r => r.SelectedQuote)
                    .ThenInclude(q => q.Agency)
                .Include(r => r.SelectedQuote)
                    .ThenInclude(q => q.Flights)
                .Include(r => r.SelectedQuote)
                    .ThenInclude(q => q.Hotels)
                .Where(r => r.Status == RequestStatus.WaitingApproval)
                .ToList();

            return Ok(requests);
        }


        [HttpGet("{id}")]
    public async Task<ActionResult<RequestDetailsDto>> GetRequest(int id)
    {
        var request = await _context.Requests
            .Include(r => r.Project)
            .Include(r => r.Quotes)
                .ThenInclude(q => q.Flights)
            .Include(r => r.Quotes)
                .ThenInclude(q => q.Hotels)
            .Include(r => r.Quotes)
                .ThenInclude(q => q.Agency)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
            return NotFound();

        // map to DTO
        var dto = new RequestDetailsDto
        {
            Id = request.Id,
            ProjectId = request.ProjectId,
            ProjectName = request.Project?.Name,
            Description = request.Description,
            OriginCity = request.OriginCity,
            DestinationCity = request.DestinationCity,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsRound = request.IsRound,
            NeedHotel = request.NeedHotel,
            Status = request.Status,
            SelectedQuoteId = request.SelectedQuoteId,
            Quotes = request.Quotes.Select(q => new QuoteDetailsDto
            {
                Id = q.Id,
                Agency = new AgencyDto
                {
                    Id = q.Agency.Id,
                    Name = q.Agency.Name
                },
                Flights = q.Flights.Select(f => new QuoteFlightDto
                {
                    FlightNumber = f.FlightNumber,
                    DepartureAirport = f.DepartureAirport,
                    ArrivalAirport = f.ArrivalAirport,
                    DepartureTime = f.DepartureTime,
                    ArrivalTime = f.ArrivalTime,
                    Price = f.Price
                }).ToList(),
                Hotels = q.Hotels.Select(h => new QuoteHotelDto
                {
                    HotelName = h.HotelName,
                    CheckIn = h.CheckIn,
                    CheckOut = h.CheckOut,
                    PricePerNight = h.PricePerNight
                }).ToList()
            }).ToList()
        };

        // Also attach the selected quote object (optional but useful)
        if (dto.SelectedQuoteId.HasValue)
        {
            dto.SelectedQuote = dto.Quotes.FirstOrDefault(q => q.Id == dto.SelectedQuoteId.Value);
        }

        return Ok(dto);
    }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Request>>> GetRequests()
        {
            return await _context.Requests
                .Include(r => r.Project)               
                .Include(r => r.SelectedQuote)!
                    .ThenInclude(sq => sq.Agency)
                .ToListAsync();
        }
        [HttpGet("facilitator-view")]
        public IActionResult GetRequestsForFacilitator()
        {
            var submitted = _context.Requests
                .Where(r => r.Status == RequestStatus.Submitted)
                .ToList();

            var ongoing = _context.Requests
                .Where(r => r.Status == RequestStatus.WaitingQuotes)
                .ToList();

            return Ok(new {
                SubmittedRequests = submitted,
                OngoingRequests = ongoing
    });
        }
        [HttpPut("{id}/start-quoting")]
        public async Task<IActionResult> StartQuoting(int id)
        {
            var request = _context.Requests.Find(id);
            if (request == null) return NotFound();

            if (request.Status == RequestStatus.Submitted)
            {
                request.Status = RequestStatus.WaitingQuotes;
                _context.SaveChanges();
                return Ok();
            }

            return BadRequest("Only submitted requests can be moved.");

        }

        [HttpGet("traveler/{travelerId}")]
        public async Task<ActionResult<IEnumerable<Request>>> GetTravelerRequests(int travelerId)
        {
            const int hardcodedTravelerId = 1; 

            if (travelerId != hardcodedTravelerId)
            {
                return Forbid("Access denied. You can only view your own requests.");
            }

            var requests = await _context.Requests
                                        .Include(r => r.Project)
                                        .Where(r => r.TravelerId == travelerId)
                                        .Include(r => r.SelectedQuote)!
                                            .ThenInclude(sq => sq.Agency)
                                        .ToListAsync();

            return requests;
        }
        
        [HttpPut("{id}/manager-decision")]
        public async Task<IActionResult> ManagerDecision(int id, [FromBody] ManagerDecisionDto dto)
        {
            var request = await _context.Requests.FindAsync(id);
            if (request == null) return NotFound();

            if (dto.Decision == "approve")
                request.Status = RequestStatus.Approved;
            else if (dto.Decision == "reject")
                request.Status = RequestStatus.Rejected;
            else
                return BadRequest("Invalid decision.");

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRequest(int id, [FromBody] UpdateRequestDto requestDto)
        {
            if (id != requestDto.Id)
            {
                return BadRequest("Request ID in URL does not match ID in payload.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var request = await _context.Requests.FindAsync(id);
            if (request == null)
            {
                return NotFound($"Request with ID {id} not found.");
            }

            request.Status = requestDto.Status;

            if (requestDto.SelectedQuoteId.HasValue)
            {
                var quoteExistsForRequest = await _context.Quotes
                                                        .AnyAsync(q => q.Id == requestDto.SelectedQuoteId.Value && q.RequestId == id);
                if (!quoteExistsForRequest)
                {
                    ModelState.AddModelError(nameof(requestDto.SelectedQuoteId), "Selected Quote ID does not belong to this request.");
                    return BadRequest(ModelState);
                }
                request.SelectedQuoteId = requestDto.SelectedQuoteId.Value;
            } else if (requestDto.SelectedQuoteId == null && request.SelectedQuoteId.HasValue) {
                request.SelectedQuoteId = null;
            }

            _context.Entry(request).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RequestExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool RequestExists(int id)
        {
            return _context.Requests.Any(e => e.Id == id);
        }
    }
}
