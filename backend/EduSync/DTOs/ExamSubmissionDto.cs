using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduSync.DTOs
{
    public class ExamSubmissionDto
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public DateTime SubmissionTime { get; set; }
        public double Score { get; set; }
        public string? Feedback { get; set; }
        public List<SubmitAnswerDto> Answers { get; set; }
    }
} 