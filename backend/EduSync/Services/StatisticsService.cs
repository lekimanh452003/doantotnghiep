using Microsoft.EntityFrameworkCore;
using EduSync.Data;
using EduSync.DTOs;
using EduSync.Models;
using EduSync.Exceptions;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace EduSync.Services
{
    public interface IStatisticsService
    {
        Task<StudentProgressDto> GetStudentProgressAsync(int classId, int studentId);
        Task<ClassStatisticsDto> GetClassStatisticsAsync(int classId);
        Task<AttendanceReportDto> GetAttendanceReportAsync(int lessonId);
        Task<GradeReportDto> GetAssignmentGradeReportAsync(int assignmentId);
        Task<GradeReportDto> GetExamGradeReportAsync(int examId);
        Task<StudyTimeReportDto> GetStudyTimeReportAsync(int studentId, int classId);
        Task<ExamStatisticsDto> GetExamStatisticsAsync(int examId);
    }

    public class StatisticsService : IStatisticsService
    {
        private readonly ApplicationDbContext _context;

        public StatisticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StudentProgressDto> GetStudentProgressAsync(int classId, int studentId)
        {
            var student = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == studentId);

            if (student == null)
            {
                throw new Exception("Student not found");
            }

            // Get assignments data
            var assignments = await _context.Assignments
                .Where(a => a.ClassId == classId)
                .Include(a => a.Submissions.Where(s => s.StudentId == studentId))
                .ToListAsync();

            var totalAssignments = assignments.Count;
            var completedAssignments = assignments.Count(a => a.Submissions.Any());
            var averageAssignmentScore = assignments
                .Where(a => a.Submissions.Any())
                .Average(a => (double?)(a.Submissions.FirstOrDefault()?.Score ?? 0)) ?? 0;

            // Get exams data
            var exams = await _context.Exams
                .Where(e => e.ClassId == classId)
                .Include(e => e.Submissions.Where(s => s.StudentId == studentId))
                .ToListAsync();

            var totalExams = exams.Count;
            var completedExams = exams.Count(e => e.Submissions.Any());
            var averageExamScore = exams
                .Where(e => e.Submissions.Any())
                .Average(e => (double?)(e.Submissions.FirstOrDefault()?.Score ?? 0)) ?? 0;

            // Get attendance data
            var lessons = await _context.Lessons
                .Where(l => l.ClassId == classId)
                .Include(l => l.Attendances.Where(a => a.StudentId == studentId))
                .ToListAsync();

            var totalLessons = lessons.Count;
            var presentCount = lessons.Count(l => l.Attendances.Any(a => a.IsPresent));

            // Get discussion data
            var discussions = await _context.Discussions
                .Where(d => d.ClassId == classId && d.CreatorId == studentId)
                .ToListAsync();

            var comments = await _context.Comments
                .Where(c => c.UserId == studentId && c.Discussion.ClassId == classId)
                .ToListAsync();

            return new StudentProgressDto
            {
                StudentId = studentId,
                StudentName = student.FullName,
                TotalAssignments = totalAssignments,
                CompletedAssignments = completedAssignments,
                AssignmentCompletionRate = totalAssignments > 0 ? (double)completedAssignments / totalAssignments * 100 : 0,
                AverageAssignmentScore = averageAssignmentScore,
                TotalExams = totalExams,
                CompletedExams = completedExams,
                ExamCompletionRate = totalExams > 0 ? (double)completedExams / totalExams * 100 : 0,
                AverageExamScore = averageExamScore,
                TotalAttendance = totalLessons,
                PresentCount = presentCount,
                AttendanceRate = totalLessons > 0 ? (double)presentCount / totalLessons * 100 : 0,
                TotalDiscussions = discussions.Count,
                TotalComments = comments.Count
            };
        }

        public async Task<ClassStatisticsDto> GetClassStatisticsAsync(int classId)
        {
            var classEntity = await _context.Classes
                .Include(c => c.Students)
                .FirstOrDefaultAsync(c => c.Id == classId);

            if (classEntity == null)
            {
                throw new Exception("Class not found");
            }

            var studentIds = classEntity.Students.Select(s => s.StudentId).ToList();

            // Get assignments data
            var assignments = await _context.Assignments
                .Where(a => a.ClassId == classId)
                .Include(a => a.Submissions)
                .ToListAsync();

            var averageAssignmentCompletionRate = studentIds.Average(studentId =>
            {
                var studentAssignments = assignments.Count(a => a.Submissions.Any(s => s.StudentId == studentId));
                return assignments.Count > 0 ? (double)studentAssignments / assignments.Count * 100 : 0;
            });

            var averageAssignmentScore = assignments
                .SelectMany(a => a.Submissions)
                .Where(s => s.Score.HasValue)
                .Select(s => (double)s.Score.Value)
                .DefaultIfEmpty()
                .Average();

            // Get exams data
            var exams = await _context.Exams
                .Where(e => e.ClassId == classId)
                .Include(e => e.Submissions)
                .ToListAsync();

            var averageExamScore = exams
                .SelectMany(e => e.Submissions)
                .Select(s => s.Score)
                .DefaultIfEmpty()
                .Average();

            // Get attendance data
            var lessons = await _context.Lessons
                .Where(l => l.ClassId == classId)
                .Include(l => l.Attendances)
                .ToListAsync();

            var averageAttendanceRate = studentIds.Average(studentId =>
            {
                var studentAttendance = lessons.Count(l => l.Attendances.Any(a => a.StudentId == studentId && a.IsPresent));
                return lessons.Count > 0 ? (double)studentAttendance / lessons.Count * 100 : 0;
            });

            // Get active students (attended at least one lesson in the last month)
            var lastMonth = DateTime.UtcNow.AddMonths(-1);
            var activeStudents = await _context.Attendances
                .Where(a => a.Lesson.ClassId == classId && a.IsPresent && a.Lesson.ScheduledTime >= lastMonth)
                .Select(a => a.StudentId)
                .Distinct()
                .CountAsync();

            // Get discussions count
            var discussionsCount = await _context.Discussions
                .Where(d => d.ClassId == classId)
                .CountAsync();

            return new ClassStatisticsDto
            {
                ClassId = classId,
                ClassName = classEntity.Name,
                TotalStudents = studentIds.Count,
                ActiveStudents = activeStudents,
                AverageAttendanceRate = averageAttendanceRate,
                AverageAssignmentCompletionRate = averageAssignmentCompletionRate,
                AverageAssignmentScore = averageAssignmentScore,
                AverageExamScore = averageExamScore,
                TotalLessons = lessons.Count,
                CompletedLessons = lessons.Count(l => l.ScheduledTime < DateTime.UtcNow),
                TotalAssignments = assignments.Count,
                TotalExams = exams.Count,
                TotalDiscussions = discussionsCount
            };
        }

        public async Task<AttendanceReportDto> GetAttendanceReportAsync(int lessonId)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Class)
                    .ThenInclude(c => c.Students)
                        .ThenInclude(cs => cs.Student)
                .Include(l => l.Attendances)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null)
            {
                throw new Exception("Lesson not found");
            }

            var studentIds = lesson.Class.Students.Select(s => s.StudentId).ToList();
            var presentCount = lesson.Attendances.Count(a => a.IsPresent);

            var details = lesson.Class.Students.Select(cs => new AttendanceDetailDto
            {
                StudentId = cs.StudentId,
                StudentName = cs.Student.FullName,
                IsPresent = lesson.Attendances.Any(a => a.StudentId == cs.StudentId && a.IsPresent),
                Note = lesson.Attendances.FirstOrDefault(a => a.StudentId == cs.StudentId)?.Note ?? ""
            }).ToList();

            return new AttendanceReportDto
            {
                LessonId = lessonId,
                LessonTitle = lesson.Title,
                LessonDate = lesson.ScheduledTime,
                TotalStudents = studentIds.Count,
                PresentCount = presentCount,
                AbsentCount = studentIds.Count - presentCount,
                AttendanceRate = studentIds.Count > 0 ? (double)presentCount / studentIds.Count * 100 : 0,
                Details = details
            };
        }

        public async Task<GradeReportDto> GetAssignmentGradeReportAsync(int assignmentId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Class)
                    .ThenInclude(c => c.Students)
                        .ThenInclude(cs => cs.Student)
                .Include(a => a.Submissions)
                .FirstOrDefaultAsync(a => a.Id == assignmentId);

            if (assignment == null)
            {
                throw new Exception("Assignment not found");
            }

            var studentIds = assignment.Class.Students.Select(s => s.StudentId).ToList();
            var submissions = assignment.Submissions.ToList();

            var details = assignment.Class.Students.Select(cs => new GradeDetailDto
            {
                StudentId = cs.StudentId,
                StudentName = cs.Student.FullName,
                HasSubmitted = submissions.Any(s => s.StudentId == cs.StudentId),
                SubmissionTime = submissions.FirstOrDefault(s => s.StudentId == cs.StudentId)?.SubmissionEndTime,
                Score = submissions.FirstOrDefault(s => s.StudentId == cs.StudentId)?.Score.HasValue == true ? 
                    (double)submissions.FirstOrDefault(s => s.StudentId == cs.StudentId).Score.Value : null,
                Feedback = submissions.FirstOrDefault(s => s.StudentId == cs.StudentId)?.Feedback
            }).ToList();

            var scores = submissions
                .Where(s => s.Score.HasValue)
                .Select(s => (double)s.Score.Value)
                .ToList();

            return new GradeReportDto
            {
                Type = "Assignment",
                ItemId = assignmentId,
                ItemTitle = assignment.Title,
                DueDate = assignment.DueDate,
                TotalStudents = studentIds.Count,
                NumberOfSubmissions = submissions.Count,
                SubmissionRate = studentIds.Count > 0 ? (double)submissions.Count / studentIds.Count * 100 : 0,
                AverageScore = scores.Any() ? scores.Average() : 0,
                HighestScore = scores.Any() ? scores.Max() : 0,
                LowestScore = scores.Any() ? scores.Min() : 0,
                Details = details
            };
        }

        public async Task<GradeReportDto> GetExamGradeReportAsync(int examId)
        {
            var exam = await _context.Exams
                .Include(e => e.Submissions)
                    .ThenInclude(s => s.Student)
                .FirstOrDefaultAsync(e => e.Id == examId);

            if (exam == null)
            {
                throw new NotFoundException("Exam not found");
            }

            var submissions = exam.Submissions.ToList();
            var totalSubmissions = submissions.Count;
            var averageScore = submissions.Any() ? submissions.Average(s => s.Score) : 0;

            var details = submissions.Select(s => new GradeDetailDto
            {
                StudentName = s.Student.FullName,
                Score = s.Score,
                SubmissionTime = s.SubmissionTime
            }).ToList();

            return new GradeReportDto
            {
                NumberOfSubmissions = totalSubmissions,
                AverageScore = averageScore,
                Details = details
            };
        }

        public async Task<StudyTimeReportDto> GetStudyTimeReportAsync(int studentId, int classId)
        {
            var student = await _context.Users.FindAsync(studentId);
            if (student == null)
            {
                throw new NotFoundException("Student not found");
            }

            var @class = await _context.Classes
                .Include(c => c.Lessons)
                    .ThenInclude(l => l.Attendances.Where(a => a.StudentId == studentId))
                .Include(c => c.Assignments)
                    .ThenInclude(a => a.Submissions.Where(s => s.StudentId == studentId))
                .FirstOrDefaultAsync(c => c.Id == classId);

            if (@class == null)
            {
                throw new NotFoundException("Class not found");
            }

            var totalLessonTime = @class.Lessons
                .SelectMany(l => l.Attendances)
                .Where(a => a.StudentId == studentId)
                .Sum(a => (a.EndTime - a.StartTime).TotalMinutes);

            var totalAssignmentTime = @class.Assignments
                .SelectMany(a => a.Submissions)
                .Where(s => s.StudentId == studentId && s.SubmissionEndTime.HasValue);
              

            var details = new List<StudyTimeDetailDto>();

            foreach (var lesson in @class.Lessons)
            {
                var attendance = lesson.Attendances.FirstOrDefault(a => a.StudentId == studentId);
                if (attendance != null)
                {
                    details.Add(new StudyTimeDetailDto
                    {
                        Type = "Lesson",
                        ItemTitle = lesson.Title,
                        Duration = (attendance.EndTime - attendance.StartTime).TotalMinutes,
                        StartTime = attendance.StartTime,
                        EndTime = attendance.EndTime
                    });
                }
            }

           

            return new StudyTimeReportDto
            {
                StudentName = student.FullName,
                TotalStudyTime = 0,
                Details = details
            };
        }

        public async Task<ExamStatisticsDto> GetExamStatisticsAsync(int examId)
        {
            var exam = await _context.Exams
                .Include(e => e.Submissions)
                    .ThenInclude(s => s.Student)
                .FirstOrDefaultAsync(e => e.Id == examId);

            if (exam == null)
                throw new Exception("Exam not found");

            var submissions = exam.Submissions;
            var totalSubmissions = submissions.Count;
            var averageScore = totalSubmissions > 0 ? submissions.Average(s => s.Score) : 0;

            var studentStats = submissions.Select(s => new StudentExamStatisticsDto
            {
                StudentName = s.Student.FullName,
                Score = s.Score,
                SubmissionTime = s.SubmissionTime
            }).ToList();

            return new ExamStatisticsDto
            {
                TotalSubmissions = totalSubmissions,
                AverageScore = averageScore,
                StudentStats = studentStats
            };
        }
    }
} 