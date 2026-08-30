using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TheaterAdmin.Models
{
    public class Movie
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Movie name is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 200 characters")]
        [Display(Name = "Movie Name")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Release date is required")]
        [DataType(DataType.Date)]
        [Display(Name = "Release Date")]
        public DateTime ReleaseDate { get; set; }

        [Required(ErrorMessage = "Director name is required")]
        [StringLength(150, ErrorMessage = "Director name cannot exceed 150 characters")]
        public string Director { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contact email is required")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address")]
        [Display(Name = "Contact Email")]
        public string ContactEmail { get; set; } = string.Empty;

        [Required(ErrorMessage = "Language is required")]
        public Language Language { get; set; }

        [Required(ErrorMessage = "Category is required")]
        [Display(Name = "Category")]
        [ForeignKey("Category")]
        public int CategoryId { get; set; }

        public Category? Category { get; set; }
    }
}
