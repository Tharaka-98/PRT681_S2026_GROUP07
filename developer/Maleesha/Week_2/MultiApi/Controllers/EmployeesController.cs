using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiApi.Data;
using MultiApi.Models;

namespace MultiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;
    public EmployeesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetAll() =>
        await _context.Employees.OrderBy(e => e.Id).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetById(int id)
    {
        var item = await _context.Employees.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Employee>> Create(Employee employee)
    {
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Employee updated)
    {
        var item = await _context.Employees.FindAsync(id);
        if (item == null) return NotFound();
        item.FullName = updated.FullName;
        item.Department = updated.Department;
        item.Salary = updated.Salary;
        item.HireDate = updated.HireDate;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Employees.FindAsync(id);
        if (item == null) return NotFound();
        _context.Employees.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}