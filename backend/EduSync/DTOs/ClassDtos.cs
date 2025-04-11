using System.ComponentModel.DataAnnotations;

namespace EduSync.DTOs
{
    public class CreateClassDto
    {
        [Required]
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? GoogleClassroomId { get; set; }
        public string? GoogleClassroomLink { get; set; }
    }

    public class UpdateClassDto
    {
        [Required]
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? GoogleClassroomId { get; set; }
        public string? GoogleClassroomLink { get; set; }
    }

    public class ClassDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ClassCode { get; set; }
        public UserDto Teacher { get; set; }
        public string? GoogleClassroomId { get; set; }
        public string? GoogleClassroomLink { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public List<ClassStudentDto> Students { get; set; }
    }

    public class ClassStudentDto
    {
        public UserDto Student { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class JoinClassDto
    {
        [Required]
        public string ClassCode { get; set; }
    }
} 