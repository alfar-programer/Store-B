using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Smart_Store_CodeFirst_EF_MVC8.Models
{
    public class Category
    {
        public int CategoryId { get; set; }

        [Required]
        public string CategoryName { get; set; }

        public List<Product>? Products { get; set; }
    }
}
