using Microsoft.EntityFrameworkCore;
using EduSync.Data;
using EduSync.DTOs;
using EduSync.Models;

namespace EduSync.Services
{
    public interface IResourceService
    {
        Task<ResourceDto> CreateResourceAsync(int classId, int teacherId, CreateResourceDto createResourceDto);
        Task<ResourceDto> UpdateResourceAsync(int resourceId, int teacherId, UpdateResourceDto updateResourceDto);
        Task<ResourceDto> GetResourceByIdAsync(int resourceId);
        Task<List<ResourceDto>> GetClassResourcesAsync(int classId);
        Task<bool> DeleteResourceAsync(int resourceId, int teacherId);
        Task<List<ResourceDto>> GetAllResourcesAsync();
    }

    public class ResourceService : IResourceService
    {
        private readonly ApplicationDbContext _context;

        public ResourceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ResourceDto> CreateResourceAsync(int classId, int teacherId, CreateResourceDto createResourceDto)
        {
            var classEntity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);

            if (classEntity == null)
            {
                throw new Exception("Class not found or you don't have permission");
            }

            var resource = new Resource
            {
                Title = createResourceDto.Title,
                Description = createResourceDto.Description,
                Type = createResourceDto.Type,
                Url = createResourceDto.Url,
                ClassId = classId
            };

            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            return MapToResourceDto(resource);
        }

        public async Task<ResourceDto> UpdateResourceAsync(int resourceId, int teacherId, UpdateResourceDto updateResourceDto)
        {
            var resource = await _context.Resources
                .Include(r => r.Class)
                .FirstOrDefaultAsync(r => r.Id == resourceId && r.Class.TeacherId == teacherId);

            if (resource == null)
            {
                throw new Exception("Resource not found or you don't have permission");
            }

            resource.Title = updateResourceDto.Title;
            resource.Description = updateResourceDto.Description;
            resource.Type = updateResourceDto.Type;
            resource.Url = updateResourceDto.Url;

            await _context.SaveChangesAsync();

            return MapToResourceDto(resource);
        }

        public async Task<ResourceDto> GetResourceByIdAsync(int resourceId)
        {
            var resource = await _context.Resources
                .Include(r => r.Class)
                .FirstOrDefaultAsync(r => r.Id == resourceId);

            if (resource == null)
            {
                throw new Exception("Resource not found");
            }

            return MapToResourceDto(resource);
        }

        public async Task<List<ResourceDto>> GetClassResourcesAsync(int classId)
        {
            var resources = await _context.Resources
                .Include(r => r.Class)
                .Where(r => r.ClassId == classId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return resources.Select(MapToResourceDto).ToList();
        }

        public async Task<bool> DeleteResourceAsync(int resourceId, int teacherId)
        {
            var resource = await _context.Resources
                .Include(r => r.Class)
                .FirstOrDefaultAsync(r => r.Id == resourceId && r.Class.TeacherId == teacherId);

            if (resource == null)
            {
                throw new Exception("Resource not found or you don't have permission");
            }

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<ResourceDto>> GetAllResourcesAsync()
        {
            var resources = await _context.Resources
                .Include(r => r.Class)
                .Include(r => r.Lesson)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return resources.Select(MapToResourceDto).ToList();
        }

        private ResourceDto MapToResourceDto(Resource resource)
        {
            return new ResourceDto
            {
                Id = resource.Id,
                Title = resource.Title,
                Description = resource.Description,
                Type = resource.Type,
                Url = resource.Url,
                ClassId = resource.ClassId,
                CreatedAt = resource.CreatedAt
            };
        }
    }
} 