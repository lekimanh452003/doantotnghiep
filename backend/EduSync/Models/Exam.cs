using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSync.Models
{
    public class Exam
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        public int Duration { get; set; }  // in minutes

        [Required]
        public int ClassId { get; set; }
        public Class Class { get; set; } = null!;

        [Required]
        public int TotalPoints { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<ExamSubmission> Submissions { get; set; } = new List<ExamSubmission>();

        public Exam()
        {
            Questions = new List<Question>();
            Submissions = new List<ExamSubmission>();
        }
    }

    public class Question
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public QuestionType Type { get; set; }

        [Required]
        public double Points { get; set; }

        [Required]
        public int ExamId { get; set; }
        public Exam Exam { get; set; } = null!;

        // Navigation properties
        public ICollection<Option> Options { get; set; } = new List<Option>();
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();

        public Question()
        {
            Options = new List<Option>();
            Answers = new List<Answer>();
        }
    }

    public class Option
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public bool IsCorrect { get; set; }

        [Required]
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;
    }

    public class Answer
    {
        [Key]
        public int Id { get; set; }

        public string? Content { get; set; }

        public int? SelectedOptionId { get; set; }
        public Option? SelectedOption { get; set; }

        [Required]
        public double Score { get; set; }

        public string? Feedback { get; set; }

        [Required]
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;

        [Required]
        public int ExamSubmissionId { get; set; }
        public ExamSubmission ExamSubmission { get; set; } = null!;
    }

    public class ExamSubmission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime SubmissionTime { get; set; }

        [Required]
        public double Score { get; set; }

        public string? Feedback { get; set; }

        [Required]
        public int ExamId { get; set; }
        public Exam Exam { get; set; } = null!;

        [Required]
        public int StudentId { get; set; }
        public User Student { get; set; } = null!;

        public ICollection<Answer> Answers { get; set; } = new List<Answer>();

        public ExamSubmission()
        {
            Answers = new List<Answer>();
        }
    }

    public enum QuestionType
    {
        MultipleChoice,
        Essay
    }
} 