using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Services;
using TaskManagerAPI.Workflows;
using Serilog;
using Exceptionless;

var builder = WebApplication.CreateBuilder(args);

builder.AddExceptionless();
builder.Host.UseSerilog((context, _, logger) => logger
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.Seq(context.Configuration["Seq:ServerUrl"] ?? "http://seq:5341"));

// ---------------------------------------------------------------- services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Enums travel as readable strings ("High") instead of 2
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddProblemDetails();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Task Manager API",
        Version = "v4",
        Description = "Week 4 - server-side paging, sorting and filtering for enterprise grids"
    });
});

var dbPath = Environment.GetEnvironmentVariable("DB_PATH") ?? "tasks.db";
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddScoped<TaskQueryService>();
builder.Services.AddResponseCaching();
builder.Services.AddSingleton<EmailActivities>();
builder.Services.AddHostedService<TemporalEmailWorker>();

// The Next.js portal runs on :3000 in dev and behind nginx/:3000 in Docker
var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
                     ?? "http://localhost:3000,http://localhost";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .WithOrigins(allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries))
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithExposedHeaders("X-Total-Count"));
});

var app = builder.Build();
app.UseExceptionHandler();
app.UseExceptionless();
app.UseSerilogRequestLogging();

// ---------------------------------------------------------------- database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DbSeeder.Seed(db);
}

// ------------------------------------------------------------- middleware
// Swagger stays on in every environment: the marker needs to see the contract.
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Manager API v4"));

app.UseCors();
app.UseResponseCaching();
app.MapControllers();

app.Run();
