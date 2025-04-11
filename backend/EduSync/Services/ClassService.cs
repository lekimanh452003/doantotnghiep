using Microsoft.EntityFrameworkCore;
using EduSync.Data;
using EduSync.DTOs;
using EduSync.Models;

namespace EduSync.Services
{
    public interface IClassService
    {
        Task<ClassDto> CreateClassAsync(int teacherId, CreateClassDto createClassDto);
        Task<ClassDto> UpdateClassAsync(int classId, int teacherId, UpdateClassDto updateClassDto);
        Task<ClassDto> GetClassByIdAsync(int classId);
        Task<List<ClassDto>> GetTeacherClassesAsync(int teacherId);
        Task<List<ClassDto>> GetStudentClassesAsync(int studentId);
        Task<ClassDto> JoinClassAsync(int studentId, string classCode);
        Task<bool> DeleteClassAsync(int classId, int teacherId);
        Task<List<ClassDto>> GetAllClassesAsync();
    }

    public class ClassService : IClassService
    {
        private readonly ApplicationDbContext _context;

        public ClassService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClassDto> CreateClassAsync(int teacherId, CreateClassDto createClassDto)
        {
            var classCode = GenerateUniqueClassCode();

            var newClass = new Class
            {
                Name = createClassDto.Name,
                Description = createClassDto.Description,
                ClassCode = classCode,
                TeacherId = teacherId,
                GoogleClassroomId = createClassDto.GoogleClassroomId,
                GoogleClassroomLink = createClassDto.GoogleClassroomLink
            };

            _context.Classes.Add(newClass);
            await _context.SaveChangesAsync();

            return await GetClassByIdAsync(newClass.Id);
        }

        public async Task<ClassDto> UpdateClassAsync(int classId, int teacherId, UpdateClassDto updateClassDto)
        {
            var classEntity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);

            if (classEntity == null)
            {
                throw new Exception("Class not found or you don't have permission");
            }

            classEntity.Name = updateClassDto.Name;
            classEntity.Description = updateClassDto.Description;
            classEntity.GoogleClassroomId = updateClassDto.GoogleClassroomId;
            classEntity.GoogleClassroomLink = updateClassDto.GoogleClassroomLink;

            await _context.SaveChangesAsync();

            return await GetClassByIdAsync(classId);
        }

        public async Task<ClassDto> GetClassByIdAsync(int classId)
        {
            var classEntity = await _context.Classes
                .Include(c => c.Teacher)
                .Include(c => c.Students)
                    .ThenInclude(cs => cs.Student)
                .FirstOrDefaultAsync(c => c.Id == classId);

            if (classEntity == null)
            {
                throw new Exception("Class not found");
            }

            return MapToClassDto(classEntity);
        }

        public async Task<List<ClassDto>> GetTeacherClassesAsync(int teacherId)
        {
            var classes = await _context.Classes
                .Include(c => c.Teacher)
                .Include(c => c.Students)
                    .ThenInclude(cs => cs.Student)
                .Where(c => c.TeacherId == teacherId)
                .ToListAsync();

            return classes.Select(MapToClassDto).ToList();
        }

        public async Task<List<ClassDto>> GetStudentClassesAsync(int studentId)
        {
            var classes = await _context.ClassStudents
                .Include(cs => cs.Class)
                    .ThenInclude(c => c.Teacher)
                .Include(cs => cs.Class)
                    .ThenInclude(c => c.Students)
                        .ThenInclude(cs => cs.Student)
                .Where(cs => cs.StudentId == studentId)
                .Select(cs => cs.Class)
                .ToListAsync();

            return classes.Select(MapToClassDto).ToList();
        }

        public async Task<ClassDto> JoinClassAsync(int studentId, string classCode)
        {
            var classEntity = await _context.Classes
                .FirstOrDefaultAsync(c => c.ClassCode == classCode);

            if (classEntity == null)
            {
                throw new Exception("Invalid class code");
            }

            var existingEnrollment = await _context.ClassStudents
                .FirstOrDefaultAsync(cs => cs.ClassId == classEntity.Id && cs.StudentId == studentId);

            if (existingEnrollment != null)
            {
                throw new Exception("Already enrolled in this class");
            }

            var enrollment = new ClassStudent
            {
                ClassId = classEntity.Id,
                StudentId = studentId
            };

            _context.ClassStudents.Add(enrollment);
            await _context.SaveChangesAsync();

            return await GetClassByIdAsync(classEntity.Id);
        }

        public async Task<bool> DeleteClassAsync(int classId, int teacherId)
        {
            var classEntity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);

            if (classEntity == null)
            {
                throw new Exception("Class not found or you don't have permission");
            }

            _context.Classes.Remove(classEntity);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<ClassDto>> GetAllClassesAsync()
        {
            var classes = await _context.Classes
                .Include(c => c.Teacher)
                .Include(c => c.Students)
                    .ThenInclude(cs => cs.Student)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return classes.Select(MapToClassDto).ToList();
        }

        private string GenerateUniqueClassCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            string code;

            do
            {
                code = new string(Enumerable.Repeat(chars, 6)
                    .Select(s => s[random.Next(s.Length)]).ToArray());
            }
            while (_context.Classes.Any(c => c.ClassCode == code));

            return code;
        }

        private ClassDto MapToClassDto(Class classEntity)
        {
            return new ClassDto
            {
                Id = classEntity.Id,
                Name = classEntity.Name,
                Description = classEntity.Description,
                ClassCode = classEntity.ClassCode,
                Teacher = new UserDto
                {
                    Id = classEntity.Teacher.Id,
                    Email = classEntity.Teacher.Email,
                    FullName = classEntity.Teacher.FullName,
                    PhoneNumber = classEntity.Teacher.PhoneNumber,
                    Role = classEntity.Teacher.Role,
                    Avatar = classEntity.Teacher.Avatar
                },
                GoogleClassroomId = classEntity.GoogleClassroomId,
                GoogleClassroomLink = classEntity.GoogleClassroomLink,
                CreatedAt = classEntity.CreatedAt,
                IsActive = classEntity.IsActive,
                Students = classEntity.Students?.Select(cs => new ClassStudentDto
                {
                    Student = new UserDto
                    {
                        Id = cs.Student.Id,
                        Email = cs.Student.Email,
                        FullName = cs.Student.FullName,
                        PhoneNumber = cs.Student.PhoneNumber,
                        Role = cs.Student.Role,
                        Avatar = cs.Student.Avatar
                    },
                    JoinedAt = cs.JoinedAt
                }).ToList() ?? new List<ClassStudentDto>()
            };
        }
    }
} 