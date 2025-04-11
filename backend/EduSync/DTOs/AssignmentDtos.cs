using System.ComponentModel.DataAnnotations;
using EduSync.Models;

namespace EduSync.DTOs
{
    public class CreateAssignmentDto
    {
        [Required]
        public string Title { get; set; }
        public string? Description { get; set; }
        [Required]
        public DateTime DueDate { get; set; }
        [Required]
        public AssignmentType Type { get; set; }
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }
    }

    public class UpdateAssignmentDto
    {
        [Required]
        public string Title { get; set; }
        public string? Description { get; set; }
        [Required]
        public DateTime DueDate { get; set; }
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }
    }

    public class AssignmentDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int ClassId { get; set; }
        public DateTime DueDate { get; set; }
        public AssignmentType Type { get; set; }
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public List<AssignmentSubmissionDto> Submissions { get; set; }
    }

    public class AssignmentSubmissionDto
    {
        public int Id { get; set; }
        public UserDto Student { get; set; }
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? GradedAt { get; set; }
    }

    public class SubmitAssignmentDto
    {
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }
    }

    public class GradeSubmissionDto
    {
        [Required]
        [Range(0, 100)]
        public decimal Score { get; set; }
        public string? Feedback { get; set; }
    }
} 