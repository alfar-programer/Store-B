using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Smart_Store_CodeFirst_EF_MVC8.Models;

public class CategoryController : Controller
{
    private readonly ProductDbContext _context;

    public CategoryController(ProductDbContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    { 
        var categories = _context.Categories.Include(c => c.Products).ToList();
        return View(categories); 
    }

    public IActionResult Details(int id)
    {
        var category = _context.Categories.Include(c => c.Products).FirstOrDefault(c => c.CategoryId == id);
        return View(category);
    }

    public IActionResult Create()
    {
        return View(); 
    }

    [HttpPost]
    public IActionResult Create(Category category)
    {
        if (ModelState.IsValid)
        {
            _context.Categories.Add(category);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }
        return View(category);
    }

    public IActionResult Edit(int id) 
    {
        var category = _context.Categories.Find(id);
      
        return View(category);

    }


    [HttpPost]
    public IActionResult Edit(Category category)
    {
        _context.Categories.Update(category);
        _context.SaveChanges();
        return RedirectToAction("Index");
    }

    public IActionResult Delete(int id)
    {
        var category = _context.Categories.Find(id);
        _context.Categories.Remove(category);
        _context.SaveChanges();
        return RedirectToAction("Index");
    }
}
