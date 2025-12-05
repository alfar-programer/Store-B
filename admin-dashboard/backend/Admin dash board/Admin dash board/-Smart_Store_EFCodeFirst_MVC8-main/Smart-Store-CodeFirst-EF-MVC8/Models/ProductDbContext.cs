using Microsoft.EntityFrameworkCore;

namespace Smart_Store_CodeFirst_EF_MVC8.Models
{
    public class ProductDbContext : DbContext
    {
        public ProductDbContext(DbContextOptions<ProductDbContext> options)
            : base(options)
        {
            // Constructor receives options like database provider
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { CategoryId = 1, CategoryName = "Electronics" },
                new Category { CategoryId = 2, CategoryName = "Fashion" },
                new Category { CategoryId = 3, CategoryName = "Books" },
                new Category { CategoryId = 4, CategoryName = "Groceries" },
                new Category { CategoryId = 5, CategoryName = "Home & Kitchen" }
            );

            // Seed Products
            modelBuilder.Entity<Product>().HasData(
                new Product { ProductId = 1, ProductName = "Smartphone", Price = 15000, CategoryId = 1 },
                new Product { ProductId = 2, ProductName = "Laptop", Price = 45000, CategoryId = 1 },
                new Product { ProductId = 3, ProductName = "T-shirt", Price = 500, CategoryId = 2 },
                new Product { ProductId = 4, ProductName = "Cooking Oil", Price = 250, CategoryId = 4 },
                new Product { ProductId = 5, ProductName = "Notebook", Price = 100, CategoryId = 3 },
                new Product { ProductId = 6, ProductName = "Mixer Grinder", Price = 2000, CategoryId = 5 }
            );
        }
    }
}
