using System.ComponentModel.DataAnnotations;

namespace EduSync.DTOs
{
    public class ResourceDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Url { get; set; }
        public int ClassId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateResourceDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        [Url]
        public string Url { get; set; }
    }

    public class UpdateResourceDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        [Url]
        public string Url { get; set; }
    }
} 