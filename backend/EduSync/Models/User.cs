using System.ComponentModel.DataAnnotations;

namespace EduSync.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string FullName { get; set; }

        public string? PhoneNumber { get; set; }

        [Required]
        public UserRole Role { get; set; }

        public string? Avatar { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<ClassStudent> Classes { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }

        public User()
        {
            Classes = new List<ClassStudent>();
            Notifications = new List<Notification>();
        }
    }

    public enum UserRole
    {
        Admin,
        Teacher,
        Student
    }
} 