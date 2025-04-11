using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using EduSync.DTOs;
using EduSync.Services;

namespace EduSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResourceController : ControllerBase
    {
        private readonly IResourceService _resourceService;

        public ResourceController(IResourceService resourceService)
        {
            _resourceService = resourceService;
        }

        [HttpPost("class/{classId}")]
        public async Task<ActionResult<ResourceDto>> CreateResource(int classId, CreateResourceDto createResourceDto)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _resourceService.CreateResourceAsync(classId, teacherId, createResourceDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ResourceDto>> UpdateResource(int id, UpdateResourceDto updateResourceDto)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _resourceService.UpdateResourceAsync(id, teacherId, updateResourceDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ResourceDto>> GetResource(int id)
        {
            try
            {
                var response = await _resourceService.GetResourceByIdAsync(id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("class/{classId}")]
        public async Task<ActionResult<List<ResourceDto>>> GetClassResources(int classId)
        {
            try
            {
                var response = await _resourceService.GetClassResourcesAsync(classId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteResource(int id)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                await _resourceService.DeleteResourceAsync(id, teacherId);
                return Ok(new { message = "Resource deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<ResourceDto>>> GetAllResources()
        {
            try
            {
                var response = await _resourceService.GetAllResourcesAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 