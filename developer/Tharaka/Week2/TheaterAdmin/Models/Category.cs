using System.ComponentModel.DataAnnotations;

namespace TheaterAdmin.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Category name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        [Display(Name = "Category Name")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category code is required")]
        [StringLength(10, MinimumLength = 2, ErrorMessage = "Code must be between 2 and 10 characters")]
        public string Code { get; set; } = string.Empty;
    }
}
