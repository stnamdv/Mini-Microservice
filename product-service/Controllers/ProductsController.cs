using Microsoft.AspNetCore.Mvc;
using ProductService.Models;
using ProductService.Services;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductService.Services.ProductService _productService;

    public ProductsController(ProductService.Services.ProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<List<Product>> Get() =>
        await _productService.GetAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> Get(string id)
    {
        var product = await _productService.GetAsync(id);

        if (product is null)
        {
            return NotFound();
        }

        return product;
    }

    [HttpPost]
    public async Task<IActionResult> Post(Product product)
    {
        var createdProduct = await _productService.CreateAsync(product);
        return CreatedAtAction(nameof(Get), new { id = createdProduct.Id }, createdProduct);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Product product)
    {
        var existingProduct = await _productService.GetAsync(id);

        if (existingProduct is null)
        {
            return NotFound();
        }

        product.Id = existingProduct.Id;
        await _productService.UpdateAsync(id, product);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var product = await _productService.GetAsync(id);

        if (product is null)
        {
            return NotFound();
        }

        await _productService.RemoveAsync(id);

        return NoContent();
    }
}
