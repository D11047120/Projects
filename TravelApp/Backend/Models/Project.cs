using System;

namespace TravelBackend.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Code { get; set; }       
        public string Name { get; set; }
        
        public decimal Budget { get; set; }     
    }
}