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
    [Route("api/location")]
    public class LocationController : ControllerBase
    {
        private readonly List<(string Country, string City)> _locations;

        public LocationController()
        {
            // load CSV once. You can also read from database here.
            _locations = System.IO.File.ReadAllLines("Data/locations.csv")
            .Skip(1)
            .Select(line => line.Split(','))
            .Select(parts => (Country: parts[0].Trim(), City: parts[1].Trim()))
            .ToList();
            
        }

        [HttpGet("countries")]
        public IActionResult GetCountries()
        {
            var countries = _locations.Select(l => l.Country).Distinct().OrderBy(c => c);
            return Ok(countries);
        }

        [HttpGet("cities")]
        public IActionResult GetCities([FromQuery] string country)
        {
            var cities = _locations.Where(l => l.Country == country).Select(l => l.City).OrderBy(c => c);
            return Ok(cities);
        }
    }
}