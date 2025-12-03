using Microsoft.EntityFrameworkCore;
using TravelBackend.Models;

namespace TravelBackend.Data
{
    public class TravelDbContext : DbContext
    {
        public TravelDbContext(DbContextOptions<TravelDbContext> options) : base(options)
        {
            AppContext.SetSwitch("Npqsl.EnableLegacyTimestampBehavior", true);
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }

        public DbSet<Request> Requests { get; set; }
        public DbSet<Agency> Agencies { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<QuoteFlights> QuoteFlights { get; set; }
        public DbSet<QuoteHotels> QuoteHotels { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Quote>()
                .HasOne(q => q.Request)             // 1 Quote has 1 Request
                .WithMany(r => r.Quotes)            // 1 Request has X Quotes
                .HasForeignKey(q => q.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Request>()
                .HasOne(r => r.SelectedQuote)       // 1 Request has 1 SelectedQuote
                .WithOne()                          // 1 SelectedQuote 1 Request (or none)
                .HasForeignKey<Request>(r => r.SelectedQuoteId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Agency>()
                .HasIndex(a => a.Name)
                .IsUnique();

            modelBuilder.Entity<Quote>()
                .HasMany(q => q.Flights)
                .WithOne(f => f.Quote)
                .HasForeignKey(f => f.QuoteId);

            modelBuilder.Entity<Quote>()
                .HasMany(q => q.Hotels)
                .WithOne(h => h.Quote)
                .HasForeignKey(h => h.QuoteId);
            
        }
    }
}