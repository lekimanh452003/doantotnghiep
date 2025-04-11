using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduSync.Models
{
    public class Assignment
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public int ClassId { get; set; }
        public virtual Class Class { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        public AssignmentType Type { get; set; }
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public virtual ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
    }

    public enum AssignmentType
    {
        MultipleChoice,
        Essay,
        File
    }
} 