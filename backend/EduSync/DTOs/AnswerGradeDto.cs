using System.ComponentModel.DataAnnotations;

namespace EduSync.DTOs
{
    public class AnswerGradeDto
    {
        [Required]
        public int AnswerId { get; set; }

        [Required]
        public double Score { get; set; }

        public string Feedback { get; set; }
    }
} 