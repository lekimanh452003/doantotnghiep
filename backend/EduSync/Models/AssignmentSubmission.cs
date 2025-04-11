using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSync.Models
{
    [Table("AssignmentSubmissions")]
    public class AssignmentSubmission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AssignmentId { get; set; }

        [Required]
        public int StudentId { get; set; }

        public string? Content { get; set; }
        public string? FileUrl { get; set; }
        public string? AttachmentUrl { get; set; }
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime? SubmissionStartTime { get; set; }
        public DateTime? SubmissionEndTime { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? GradedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(AssignmentId))]
        public virtual Assignment Assignment { get; set; }

        [ForeignKey(nameof(StudentId))]
        public virtual User Student { get; set; }
    }
} 