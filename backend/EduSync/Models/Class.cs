using System.ComponentModel.DataAnnotations;

namespace EduSync.Models
{
    public class Class
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Required]
        public string ClassCode { get; set; }

        [Required]
        public int TeacherId { get; set; }
        public User Teacher { get; set; }

        public string? GoogleClassroomId { get; set; }
        public string? GoogleClassroomLink { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public ICollection<ClassStudent> Students { get; set; }
        public ICollection<Lesson> Lessons { get; set; }
        public ICollection<Assignment> Assignments { get; set; }
    }

    public class ClassStudent
    {
        public int ClassId { get; set; }
        public Class Class { get; set; }

        public int StudentId { get; set; }
        public User Student { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
} 