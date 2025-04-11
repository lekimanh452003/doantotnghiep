using System.ComponentModel.DataAnnotations;

namespace EduSync.DTOs
{
    public class CreateLessonDto
    {
        [Required]
        public string Title { get; set; }
        public string? Description { get; set; }
        [Required]
        public DateTime ScheduledTime { get; set; }
        public string? MeetingLink { get; set; }
        public string? MaterialUrl { get; set; }
    }

    public class UpdateLessonDto
    {
        [Required]
        public string Title { get; set; }
        public string? Description { get; set; }
        [Required]
        public DateTime ScheduledTime { get; set; }
        public string? MeetingLink { get; set; }
        public string? MaterialUrl { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class LessonDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int ClassId { get; set; }
        public DateTime ScheduledTime { get; set; }
        public string? MeetingLink { get; set; }
        public string? MaterialUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsCompleted { get; set; }
        public List<AttendanceDto> Attendances { get; set; }
    }

    public class AttendanceDto
    {
        public UserDto Student { get; set; }
        public bool IsPresent { get; set; }
        public DateTime RecordedAt { get; set; }
    }

    public class MarkAttendanceDto
    {
        [Required]
        public int StudentId { get; set; }
        [Required]
        public bool IsPresent { get; set; }
    }
} 