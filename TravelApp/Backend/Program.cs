using TravelBackend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using TravelBackend.Models;
using TravelBackend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles; 
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:3000","http://localhost:5173") // React Ports
                    .AllowAnyHeader()
                    .AllowAnyMethod();
        });
});
builder.Services.AddTransient<AuthService>();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    var key = builder.Configuration.GetValue<string>("PrivateKey");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
        ValidateIssuer = false,
        ValidateAudience = false,
    };
});


builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<TravelDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))); // Assuming you are using PostgreSQL based on UseNpgsql



var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Error"); // Generic error page in production
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(); // Must come before app.UseAuthorization() and app.MapControllers()

app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
using (var db = scope.ServiceProvider.GetRequiredService<TravelDbContext>())
{
 if (!db.Users.Where(o => o.Username == "trish.voyager@example.com").Select(o => o).Any())
 {
    User user = new User
    {
        Username = "trish.voyager@example.com",
        Name = "Trish Voyager",
        Role = "traveler",
    };
    user.PasswordHash = user.GeneratePassHash("Password1!");
    db.Users.Add(user);
    user = new()
    {
        Username = "frank.helper@example.com",
        Name = "Frank Helper",
        Role = "facilitator",
    };
    user.PasswordHash = user.GeneratePassHash("Password1!");
    db.Users.Add(user);
    user = new()
    {
        Username = "mary.decisor@example.com",
        Name = "Mary Decisor",
        Role = "manager",
    };
    user.PasswordHash = user.GeneratePassHash("Password1!");
    db.Users.Add(user);
    await db.SaveChangesAsync();
 }
}

app.MapControllers();

app.Run();
