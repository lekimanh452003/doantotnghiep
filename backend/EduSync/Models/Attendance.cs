using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSync.Models
{
    public class Attendance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int LessonId { get; set; }

        [Required]
        public int StudentId { get; set; }

        public bool IsPresent { get; set; }
        public string? Note { get; set; }
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        
        [ForeignKey(nameof(LessonId))]
        public virtual Lesson Lesson { get; set; }

        [ForeignKey(nameof(StudentId))]
        public virtual User Student { get; set; }
    }
} 