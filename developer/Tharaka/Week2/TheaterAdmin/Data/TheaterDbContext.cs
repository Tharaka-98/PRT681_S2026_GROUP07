using Microsoft.EntityFrameworkCore;
using TheaterAdmin.Models;

namespace TheaterAdmin.Data
{
    public class TheaterDbContext : DbContext
    {
        public TheaterDbContext(DbContextOptions<TheaterDbContext> options)
            : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Movie>()
                .HasOne(m => m.Category)
                .WithMany()
                .HasForeignKey(m => m.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed some initial categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Action", Code = "ACT" },
                new Category { Id = 2, Name = "Drama", Code = "DRM" },
                new Category { Id = 3, Name = "Horror", Code = "HRR" },
                new Category { Id = 4, Name = "Comedy", Code = "CMD" },
                new Category { Id = 5, Name = "Sci-Fi", Code = "SCI" }
            );
        }
    }
}
