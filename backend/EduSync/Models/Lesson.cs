using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduSync.Models
{
    public class Lesson
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public int ClassId { get; set; }
        public virtual Class Class { get; set; }

        [Required]
        public DateTime ScheduledTime { get; set; }

        public string? MeetingLink { get; set; }
        public string? MaterialUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsCompleted { get; set; }

        public virtual ICollection<Attendance> Attendances { get; set; }
        public virtual ICollection<Resource> Resources { get; set; }

        public Lesson()
        {
            Attendances = new List<Attendance>();
            Resources = new List<Resource>();
        }
    }
} 