using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduSync.Data;
using EduSync.Models;
using EduSync.DTOs;

namespace EduSync.Services
{
    public interface IExamService
    {
        Task<ExamDto> CreateExamAsync(CreateExamDto examDto);
        Task<ExamDto> GetExamByIdAsync(int id);
        Task<List<ExamDto>> GetExamsByClassIdAsync(int classId);
        Task<ExamSubmissionDto> SubmitExamAsync(SubmitExamDto submissionDto, int studentId);
        Task<List<ExamSubmissionDto>> GetSubmissionsByExamIdAsync(int examId);
        Task<ExamSubmissionDto> GradeSubmissionAsync(int submissionId, List<AnswerGradeDto> grades);
    }

    public class ExamService : IExamService
    {
        private readonly ApplicationDbContext _context;

        public ExamService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ExamDto> CreateExamAsync(CreateExamDto examDto)
        {
            var exam = new Exam
            {
                Title = examDto.Title,
                Description = examDto.Description,
                StartTime = examDto.StartTime,
                EndTime = examDto.EndTime,
                Duration = examDto.Duration,
                ClassId = examDto.ClassId,
                Questions = examDto.Questions.Select(q => new Question
                {
                    Content = q.Content,
                    Type = q.Type,
                    Points = q.Points,
                    Options = q.Type == QuestionType.MultipleChoice
                        ? q.Options.Select(o => new Option
                        {
                            Content = o.Content,
                            IsCorrect = o.IsCorrect
                        }).ToList()
                        : new List<Option>()
                }).ToList()
            };

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            return await GetExamByIdAsync(exam.Id);
        }

        public async Task<ExamDto> GetExamByIdAsync(int id)
        {
            var exam = await _context.Exams
                .Include(e => e.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exam == null)
                throw new Exception("Exam not found");

            return new ExamDto
            {
                Id = exam.Id,
                Title = exam.Title,
                Description = exam.Description,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                Duration = exam.Duration,
                ClassId = exam.ClassId,
                Questions = exam.Questions.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Content = q.Content,
                    Type = q.Type,
                    Points = q.Points,
                    Options = q.Options.Select(o => new OptionDto
                    {
                        Id = o.Id,
                        Content = o.Content,
                        IsCorrect = o.IsCorrect
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<List<ExamDto>> GetExamsByClassIdAsync(int classId)
        {
            var exams = await _context.Exams
                .Include(e => e.Questions)
                    .ThenInclude(q => q.Options)
                .Where(e => e.ClassId == classId)
                .ToListAsync();

            return exams.Select(exam => new ExamDto
            {
                Id = exam.Id,
                Title = exam.Title,
                Description = exam.Description,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                Duration = exam.Duration,
                ClassId = exam.ClassId,
                Questions = exam.Questions.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Content = q.Content,
                    Type = q.Type,
                    Points = q.Points,
                    Options = q.Options.Select(o => new OptionDto
                    {
                        Id = o.Id,
                        Content = o.Content,
                        IsCorrect = o.IsCorrect
                    }).ToList()
                }).ToList()
            }).ToList();
        }

        public async Task<ExamSubmissionDto> SubmitExamAsync(SubmitExamDto submissionDto, int studentId)
        {
            var exam = await _context.Exams
                .Include(e => e.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(e => e.Id == submissionDto.ExamId);

            if (exam == null)
                throw new Exception("Exam not found");

            var submission = new ExamSubmission
            {
                ExamId = exam.Id,
                StudentId = studentId,
                SubmissionTime = DateTime.UtcNow,
                Score = 0, // Will be calculated after grading
                Answers = submissionDto.Answers.Select(a => new Answer
                {
                    QuestionId = a.QuestionId,
                    Content = a.Content,
                    SelectedOptionId = a.SelectedOptionId,
                    Score = 0 // Will be updated after grading
                }).ToList()
            };

            _context.ExamSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            return await GetSubmissionByIdAsync(submission.Id);
        }

        public async Task<List<ExamSubmissionDto>> GetSubmissionsByExamIdAsync(int examId)
        {
            var submissions = await _context.ExamSubmissions
                .Include(s => s.Student)
                .Include(s => s.Answers)
                    .ThenInclude(a => a.Question)
                .Include(s => s.Answers)
                    .ThenInclude(a => a.SelectedOption)
                .Where(s => s.ExamId == examId)
                .ToListAsync();

            return submissions.Select(s => new ExamSubmissionDto
            {
                Id = s.Id,
                ExamId = s.ExamId,
                StudentId = s.StudentId,
                StudentName = s.Student.FullName,
                SubmissionTime = s.SubmissionTime,
                Score = s.Score,
                Feedback = s.Feedback,
                Answers = s.Answers.Select(a => new SubmitAnswerDto
                {
                    QuestionId = a.QuestionId,
                    Content = a.Content,
                    SelectedOptionId = a.SelectedOptionId,
                    Score = a.Score,
                    Feedback = a.Feedback
                }).ToList()
            }).ToList();
        }

        public async Task<ExamSubmissionDto> GradeSubmissionAsync(int submissionId, List<AnswerGradeDto> grades)
        {
            var submission = await _context.ExamSubmissions
                .Include(s => s.Student)
                .Include(s => s.Answers)
                    .ThenInclude(a => a.Question)
                .Include(s => s.Answers)
                    .ThenInclude(a => a.SelectedOption)
                .FirstOrDefaultAsync(s => s.Id == submissionId);

            if (submission == null)
                throw new Exception("Submission not found");

            foreach (var grade in grades)
            {
                var answer = submission.Answers.FirstOrDefault(a => a.Id == grade.AnswerId);
                if (answer != null)
                {
                    answer.Score = grade.Score;
                    answer.Feedback = grade.Feedback;
                }
            }

            submission.Score = submission.Answers.Sum(a => a.Score);
            await _context.SaveChangesAsync();

            return await GetSubmissionByIdAsync(submission.Id);
        }

        private async Task<ExamSubmissionDto> GetSubmissionByIdAsync(int submissionId)
        {
            var submission = await _context.ExamSubmissions
                .Include(s => s.Student)
                .Include(s => s.Answers)
                    .ThenInclude(a => a.Question)
                .Include(s => s.Answers)
                    .ThenInclude(a => a.SelectedOption)
                .FirstOrDefaultAsync(s => s.Id == submissionId);

            if (submission == null)
                throw new Exception("Submission not found");

            return new ExamSubmissionDto
            {
                Id = submission.Id,
                ExamId = submission.ExamId,
                StudentId = submission.StudentId,
                StudentName = submission.Student.FullName,
                SubmissionTime = submission.SubmissionTime,
                Score = submission.Score,
                Feedback = submission.Feedback,
                Answers = submission.Answers.Select(a => new SubmitAnswerDto
                {
                    QuestionId = a.QuestionId,
                    Content = a.Content,
                    SelectedOptionId = a.SelectedOptionId,
                    Score = a.Score,
                    Feedback = a.Feedback
                }).ToList()
            };
        }
    }
} 