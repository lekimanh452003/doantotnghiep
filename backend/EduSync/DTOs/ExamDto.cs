using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using EduSync.Models;

namespace EduSync.DTOs
{
    public class ExamDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Duration { get; set; }
        public int ClassId { get; set; }
        public List<QuestionDto> Questions { get; set; }
    }

    public class CreateExamDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        public int Duration { get; set; }

        [Required]
        public int ClassId { get; set; }

        [Required]
        public List<CreateQuestionDto> Questions { get; set; }
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public QuestionType Type { get; set; }
        public double Points { get; set; }
        public List<OptionDto> Options { get; set; }
    }

    public class CreateQuestionDto
    {
        [Required]
        public string Content { get; set; }

        [Required]
        public QuestionType Type { get; set; }

        [Required]
        public double Points { get; set; }

        public List<CreateOptionDto> Options { get; set; }
    }

    public class OptionDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class CreateOptionDto
    {
        [Required]
        public string Content { get; set; }

        [Required]
        public bool IsCorrect { get; set; }
    }

    public class SubmitExamDto
    {
        [Required]
        public int ExamId { get; set; }

        [Required]
        public List<SubmitAnswerDto> Answers { get; set; }
    }

    public class SubmitAnswerDto
    {
        [Required]
        public int QuestionId { get; set; }

        public string? Content { get; set; }

        public int? SelectedOptionId { get; set; }

        public double Score { get; set; }

        public string? Feedback { get; set; }
    }
} 