using Microsoft.EntityFrameworkCore;
using EduSync.Data;
using EduSync.DTOs;
using EduSync.Models;

namespace EduSync.Services
{
    public interface IAssignmentService
    {
        Task<AssignmentDto> CreateAssignmentAsync(int classId, int teacherId, CreateAssignmentDto createAssignmentDto);
        Task<AssignmentDto> UpdateAssignmentAsync(int assignmentId, int teacherId, UpdateAssignmentDto updateAssignmentDto);
        Task<AssignmentDto> GetAssignmentByIdAsync(int assignmentId);
        Task<List<AssignmentDto>> GetClassAssignmentsAsync(int classId);
        Task<bool> DeleteAssignmentAsync(int assignmentId, int teacherId);
        Task<AssignmentDto> SubmitAssignmentAsync(int assignmentId, int studentId, SubmitAssignmentDto submitAssignmentDto);
        Task<AssignmentDto> GradeSubmissionAsync(int assignmentId, int submissionId, int teacherId, GradeSubmissionDto gradeSubmissionDto);
        Task<List<AssignmentDto>> GetAllAssignmentsAsync();
    }

    public class AssignmentService : IAssignmentService
    {
        private readonly ApplicationDbContext _context;

        public AssignmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AssignmentDto> CreateAssignmentAsync(int classId, int teacherId, CreateAssignmentDto createAssignmentDto)
        {
            var classEntity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == classId && c.TeacherId == teacherId);

            if (classEntity == null)
            {
                throw new Exception("Class not found or you don't have permission");
            }

            var assignment = new Assignment
            {
                Title = createAssignmentDto.Title,
                Description = createAssignmentDto.Description,
                ClassId = classId,
                DueDate = createAssignmentDto.DueDate,
                Type = createAssignmentDto.Type,
                Content = createAssignmentDto.Content,
                AttachmentUrl = createAssignmentDto.AttachmentUrl
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            return await GetAssignmentByIdAsync(assignment.Id);
        }

        public async Task<AssignmentDto> UpdateAssignmentAsync(int assignmentId, int teacherId, UpdateAssignmentDto updateAssignmentDto)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Class)
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.Class.TeacherId == teacherId);

            if (assignment == null)
            {
                throw new Exception("Assignment not found or you don't have permission");
            }

            assignment.Title = updateAssignmentDto.Title;
            assignment.Description = updateAssignmentDto.Description;
            assignment.DueDate = updateAssignmentDto.DueDate;
            assignment.Content = updateAssignmentDto.Content;
            assignment.AttachmentUrl = updateAssignmentDto.AttachmentUrl;

            await _context.SaveChangesAsync();

            return await GetAssignmentByIdAsync(assignmentId);
        }

        public async Task<AssignmentDto> GetAssignmentByIdAsync(int assignmentId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Submissions)
                    .ThenInclude(s => s.Student)
                .FirstOrDefaultAsync(a => a.Id == assignmentId);

            if (assignment == null)
            {
                throw new Exception("Assignment not found");
            }

            return MapToAssignmentDto(assignment);
        }

        public async Task<List<AssignmentDto>> GetClassAssignmentsAsync(int classId)
        {
            var assignments = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Submissions)
                    .ThenInclude(s => s.Student)
                .Where(a => a.ClassId == classId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return assignments.Select(MapToAssignmentDto).ToList();
        }

        public async Task<bool> DeleteAssignmentAsync(int assignmentId, int teacherId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Class)
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.Class.TeacherId == teacherId);

            if (assignment == null)
            {
                throw new Exception("Assignment not found or you don't have permission");
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<AssignmentDto> SubmitAssignmentAsync(int assignmentId, int studentId, SubmitAssignmentDto submitAssignmentDto)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Submissions)
                .FirstOrDefaultAsync(a => a.Id == assignmentId);

            if (assignment == null)
            {
                throw new Exception("Assignment not found");
            }

            if (assignment.DueDate < DateTime.UtcNow)
            {
                throw new Exception("Assignment submission deadline has passed");
            }

            var existingSubmission = await _context.AssignmentSubmissions
                .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

            if (existingSubmission != null)
            {
                existingSubmission.Content = submitAssignmentDto.Content;
                existingSubmission.AttachmentUrl = submitAssignmentDto.AttachmentUrl;
                existingSubmission.SubmittedAt = DateTime.UtcNow;
            }
            else
            {
                var submission = new AssignmentSubmission
                {
                    AssignmentId = assignmentId,
                    StudentId = studentId,
                    Content = submitAssignmentDto.Content,
                    AttachmentUrl = submitAssignmentDto.AttachmentUrl
                };
                _context.AssignmentSubmissions.Add(submission);
            }

            await _context.SaveChangesAsync();

            return await GetAssignmentByIdAsync(assignmentId);
        }

        public async Task<AssignmentDto> GradeSubmissionAsync(int assignmentId, int submissionId, int teacherId, GradeSubmissionDto gradeSubmissionDto)
        {
            var submission = await _context.AssignmentSubmissions
                .Include(s => s.Assignment)
                    .ThenInclude(a => a.Class)
                .FirstOrDefaultAsync(s => s.Id == submissionId && 
                    s.AssignmentId == assignmentId && 
                    s.Assignment.Class.TeacherId == teacherId);

            if (submission == null)
            {
                throw new Exception("Submission not found or you don't have permission");
            }

            submission.Score = gradeSubmissionDto.Score;
            submission.Feedback = gradeSubmissionDto.Feedback;
            submission.GradedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetAssignmentByIdAsync(assignmentId);
        }

        public async Task<List<AssignmentDto>> GetAllAssignmentsAsync()
        {
            var assignments = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Submissions)
                    .ThenInclude(s => s.Student)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return assignments.Select(MapToAssignmentDto).ToList();
        }

        private AssignmentDto MapToAssignmentDto(Assignment assignment)
        {
            return new AssignmentDto
            {
                Id = assignment.Id,
                Title = assignment.Title,
                Description = assignment.Description,
                ClassId = assignment.ClassId,
                DueDate = assignment.DueDate,
                Type = assignment.Type,
                Content = assignment.Content,
                AttachmentUrl = assignment.AttachmentUrl,
                CreatedAt = assignment.CreatedAt,
                IsActive = assignment.IsActive,
                Submissions = assignment.Submissions?.Select(s => new AssignmentSubmissionDto
                {
                    Id = s.Id,
                    Student = new UserDto
                    {
                        Id = s.Student.Id,
                        Email = s.Student.Email,
                        FullName = s.Student.FullName,
                        PhoneNumber = s.Student.PhoneNumber,
                        Role = s.Student.Role,
                        Avatar = s.Student.Avatar
                    },
                    Content = s.Content,
                    AttachmentUrl = s.AttachmentUrl,
                    Score = s.Score,
                    Feedback = s.Feedback,
                    SubmittedAt = s.SubmittedAt,
                    GradedAt = s.GradedAt
                }).ToList() ?? new List<AssignmentSubmissionDto>()
            };
        }
    }
} 