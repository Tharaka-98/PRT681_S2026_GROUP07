using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "TaskDatabase"
        )
    )
);

var app = builder.Build();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();