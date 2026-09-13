using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiApi.Data;
using MultiApi.Models;

namespace MultiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    public ProductsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll() =>
        await _context.Products.OrderBy(p => p.Id).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var item = await _context.Products.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Product updated)
    {
        var item = await _context.Products.FindAsync(id);
        if (item == null) return NotFound();
        item.Name = updated.Name;
        item.Price = updated.Price;
        item.Category = updated.Category;
        item.InStock = updated.InStock;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Products.FindAsync(id);
        if (item == null) return NotFound();
        _context.Products.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}