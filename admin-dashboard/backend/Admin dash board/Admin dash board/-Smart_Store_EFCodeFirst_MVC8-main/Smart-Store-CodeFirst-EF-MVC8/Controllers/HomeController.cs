using Microsoft.AspNetCore.Mvc;
using Smart_Store_CodeFirst_EF_MVC8.Models;

public class HomeController : Controller
{
    private readonly ProductDbContext _context;

    public HomeController(ProductDbContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    {
        ViewBag.TotalProducts = _context.Products.Count();
        ViewBag.TotalCategories = _context.Categories.Count();
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }
}
