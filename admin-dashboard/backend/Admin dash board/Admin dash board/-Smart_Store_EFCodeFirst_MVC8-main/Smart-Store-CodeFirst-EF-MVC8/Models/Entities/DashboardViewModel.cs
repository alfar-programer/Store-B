using System.Collections.Generic;

namespace Smart_Store_CodeFirst_EF_MVC8.Models
{
    public class DashboardViewModel
    {
        public int TotalCategories { get; set; }
        public int TotalProducts { get; set; }
        public List<Product>? LatestProducts { get; set; }
    }
}
