using Microsoft.EntityFrameworkCore;
using EduSync.Data;
using EduSync.DTOs;
using EduSync.Models;

namespace EduSync.Services
{
    public interface ILessonService
    {
        Task<LessonDto> CreateLessonAsync(int classId, int teacherId, CreateLessonDto createLessonDto);
        Task<LessonDto> UpdateLessonAsync(int lessonId, int teacherId, UpdateLessonDto updateLessonDto);
        Task<LessonDto> GetLessonByIdAsync(int lessonId);
        Task<List<LessonDto>> GetClassLessonsAsync(int classId);
        Task<bool> DeleteLessonAsync(int lessonId, int teacherId);
        Task<LessonDto> MarkAttendanceAsync(int lessonId, int teacherId, List<MarkAttendanceDto> attendances);
        Task<List<LessonDto>> GetAllLessonsAsync();
    }

    public class LessonService : ILessonService
    {
        private readonly ApplicationDbContext _context;

        public LessonService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LessonDto> CreateLessonAsync(int classId, int teacherId, CreateLessonDto createLessonDto)
        {
            var classEntity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);

            if (classEntity == null)
            {
                throw new Exception("Class not found or you don't have permission");
            }

            var lesson = new Lesson
            {
                Title = createLessonDto.Title,
                Description = createLessonDto.Description,
                ClassId = classId,
                ScheduledTime = createLessonDto.ScheduledTime,
                MeetingLink = createLessonDto.MeetingLink,
                MaterialUrl = createLessonDto.MaterialUrl
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            return await GetLessonByIdAsync(lesson.Id);
        }

        public async Task<LessonDto> UpdateLessonAsync(int lessonId, int teacherId, UpdateLessonDto updateLessonDto)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Class)
                .FirstOrDefaultAsync(l => l.Id == lessonId && l.Class.TeacherId == teacherId);

            if (lesson == null)
            {
                throw new Exception("Lesson not found or you don't have permission");
            }

            lesson.Title = updateLessonDto.Title;
            lesson.Description = updateLessonDto.Description;
            lesson.ScheduledTime = updateLessonDto.ScheduledTime;
            lesson.MeetingLink = updateLessonDto.MeetingLink;
            lesson.MaterialUrl = updateLessonDto.MaterialUrl;
            lesson.IsCompleted = updateLessonDto.IsCompleted;

            await _context.SaveChangesAsync();

            return await GetLessonByIdAsync(lessonId);
        }

        public async Task<LessonDto> GetLessonByIdAsync(int lessonId)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Class)
                .Include(l => l.Attendances)
                    .ThenInclude(a => a.Student)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null)
            {
                throw new Exception("Lesson not found");
            }

            return MapToLessonDto(lesson);
        }

        public async Task<List<LessonDto>> GetClassLessonsAsync(int classId)
        {
            var lessons = await _context.Lessons
                .Include(l => l.Class)
                .Include(l => l.Attendances)
                    .ThenInclude(a => a.Student)
                .Where(l => l.ClassId == classId)
                .OrderBy(l => l.ScheduledTime)
                .ToListAsync();

            return lessons.Select(MapToLessonDto).ToList();
        }

        public async Task<bool> DeleteLessonAsync(int lessonId, int teacherId)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Class)
                .FirstOrDefaultAsync(l => l.Id == lessonId && l.Class.TeacherId == teacherId);

            if (lesson == null)
            {
                throw new Exception("Lesson not found or you don't have permission");
            }

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<LessonDto> MarkAttendanceAsync(int lessonId, int teacherId, List<MarkAttendanceDto> attendances)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Class)
                .FirstOrDefaultAsync(l => l.Id == lessonId && l.Class.TeacherId == teacherId);

            if (lesson == null)
            {
                throw new Exception("Lesson not found or you don't have permission");
            }

            // Remove existing attendances
            var existingAttendances = await _context.Attendances
                .Where(a => a.LessonId == lessonId)
                .ToListAsync();

            _context.Attendances.RemoveRange(existingAttendances);

            // Add new attendances
            var newAttendances = attendances.Select(a => new Attendance
            {
                LessonId = lessonId,
                StudentId = a.StudentId,
                IsPresent = a.IsPresent
            });

            await _context.Attendances.AddRangeAsync(newAttendances);
            await _context.SaveChangesAsync();

            return await GetLessonByIdAsync(lessonId);
        }

        public async Task<List<LessonDto>> GetAllLessonsAsync()
        {
            var lessons = await _context.Lessons
                .Include(l => l.Class)
                .Include(l => l.Attendances)
                    .ThenInclude(a => a.Student)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return lessons.Select(MapToLessonDto).ToList();
        }

        private LessonDto MapToLessonDto(Lesson lesson)
        {
            return new LessonDto
            {
                Id = lesson.Id,
                Title = lesson.Title,
                Description = lesson.Description,
                ClassId = lesson.ClassId,
                ScheduledTime = lesson.ScheduledTime,
                MeetingLink = lesson.MeetingLink,
                MaterialUrl = lesson.MaterialUrl,
                CreatedAt = lesson.CreatedAt,
                IsCompleted = lesson.IsCompleted,
                Attendances = lesson.Attendances?.Select(a => new AttendanceDto
                {
                    Student = new UserDto
                    {
                        Id = a.Student.Id,
                        Email = a.Student.Email,
                        FullName = a.Student.FullName,
                        PhoneNumber = a.Student.PhoneNumber,
                        Role = a.Student.Role,
                        Avatar = a.Student.Avatar
                    },
                    IsPresent = a.IsPresent,
                    RecordedAt = a.RecordedAt
                }).ToList() ?? new List<AttendanceDto>()
            };
        }
    }
} 