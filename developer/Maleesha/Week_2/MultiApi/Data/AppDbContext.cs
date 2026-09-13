using Microsoft.EntityFrameworkCore;
using MultiApi.Models;

namespace MultiApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Book> Books => Set<Book>();
}