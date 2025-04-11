using System.ComponentModel.DataAnnotations;

namespace EduSync.DTOs
{
    public class DiscussionDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int ClassId { get; set; }
        public int CreatorId { get; set; }
        public string CreatorName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<CommentDto> Comments { get; set; }
    }

    public class CreateDiscussionDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public int ClassId { get; set; }
    }

    public class UpdateDiscussionDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public int DiscussionId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateCommentDto
    {
        [Required]
        public string Content { get; set; }

        [Required]
        public int DiscussionId { get; set; }
    }

    public class UpdateCommentDto
    {
        [Required]
        public string Content { get; set; }
    }
} 