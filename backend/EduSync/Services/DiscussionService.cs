using Microsoft.EntityFrameworkCore;
using EduSync.Data;
using EduSync.DTOs;
using EduSync.Models;

namespace EduSync.Services
{
    public interface IDiscussionService
    {
        Task<List<DiscussionDto>> GetAllDiscussionsAsync();
        Task<DiscussionDto> CreateDiscussionAsync(int userId, CreateDiscussionDto createDiscussionDto);
        Task<DiscussionDto> UpdateDiscussionAsync(int discussionId, int userId, UpdateDiscussionDto updateDiscussionDto);
        Task<DiscussionDto> GetDiscussionByIdAsync(int discussionId);
        Task<List<DiscussionDto>> GetClassDiscussionsAsync(int classId);
        Task<bool> DeleteDiscussionAsync(int discussionId, int userId);
        Task<CommentDto> AddCommentAsync(int userId, CreateCommentDto createCommentDto);
        Task<CommentDto> UpdateCommentAsync(int commentId, int userId, UpdateCommentDto updateCommentDto);
        Task<bool> DeleteCommentAsync(int commentId, int userId);
    }

    public class DiscussionService : IDiscussionService
    {
        private readonly ApplicationDbContext _context;

        public DiscussionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<DiscussionDto>> GetAllDiscussionsAsync()
        {
            var discussions = await _context.Discussions
                .Include(d => d.Class)
                .Include(d => d.Creator)
                .Include(d => d.Comments)
                    .ThenInclude(c => c.User)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return discussions.Select(MapToDiscussionDto).ToList();
        }

        public async Task<DiscussionDto> CreateDiscussionAsync(int userId, CreateDiscussionDto createDiscussionDto)
        {
            var classEntity = await _context.Classes
                .FirstOrDefaultAsync(c => c.Id == createDiscussionDto.ClassId);

            if (classEntity == null)
            {
                throw new Exception("Class not found");
            }

            var discussion = new Discussion
            {
                Title = createDiscussionDto.Title,
                Content = createDiscussionDto.Content,
                ClassId = createDiscussionDto.ClassId,
                CreatorId = userId
            };

            _context.Discussions.Add(discussion);
            await _context.SaveChangesAsync();

            return await GetDiscussionByIdAsync(discussion.Id);
        }

        public async Task<DiscussionDto> UpdateDiscussionAsync(int discussionId, int userId, UpdateDiscussionDto updateDiscussionDto)
        {
            var discussion = await _context.Discussions
                .FirstOrDefaultAsync(d => d.Id == discussionId && d.CreatorId == userId);

            if (discussion == null)
            {
                throw new Exception("Discussion not found or you don't have permission");
            }

            discussion.Title = updateDiscussionDto.Title;
            discussion.Content = updateDiscussionDto.Content;
            discussion.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetDiscussionByIdAsync(discussionId);
        }

        public async Task<DiscussionDto> GetDiscussionByIdAsync(int discussionId)
        {
            var discussion = await _context.Discussions
                .Include(d => d.Creator)
                .Include(d => d.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(d => d.Id == discussionId);

            if (discussion == null)
            {
                throw new Exception("Discussion not found");
            }

            return MapToDiscussionDto(discussion);
        }

        public async Task<List<DiscussionDto>> GetClassDiscussionsAsync(int classId)
        {
            var discussions = await _context.Discussions
                .Include(d => d.Creator)
                .Include(d => d.Comments)
                    .ThenInclude(c => c.User)
                .Where(d => d.ClassId == classId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return discussions.Select(MapToDiscussionDto).ToList();
        }

        public async Task<bool> DeleteDiscussionAsync(int discussionId, int userId)
        {
            var discussion = await _context.Discussions
                .FirstOrDefaultAsync(d => d.Id == discussionId && d.CreatorId == userId);

            if (discussion == null)
            {
                throw new Exception("Discussion not found or you don't have permission");
            }

            _context.Discussions.Remove(discussion);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<CommentDto> AddCommentAsync(int userId, CreateCommentDto createCommentDto)
        {
            var discussion = await _context.Discussions
                .FirstOrDefaultAsync(d => d.Id == createCommentDto.DiscussionId);

            if (discussion == null)
            {
                throw new Exception("Discussion not found");
            }

            var comment = new Comment
            {
                Content = createCommentDto.Content,
                DiscussionId = createCommentDto.DiscussionId,
                UserId = userId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return await GetCommentByIdAsync(comment.Id);
        }

        public async Task<CommentDto> UpdateCommentAsync(int commentId, int userId, UpdateCommentDto updateCommentDto)
        {
            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.UserId == userId);

            if (comment == null)
            {
                throw new Exception("Comment not found or you don't have permission");
            }

            comment.Content = updateCommentDto.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCommentByIdAsync(commentId);
        }

        public async Task<bool> DeleteCommentAsync(int commentId, int userId)
        {
            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.UserId == userId);

            if (comment == null)
            {
                throw new Exception("Comment not found or you don't have permission");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<CommentDto> GetCommentByIdAsync(int commentId)
        {
            var comment = await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
            {
                throw new Exception("Comment not found");
            }

            return MapToCommentDto(comment);
        }

        private DiscussionDto MapToDiscussionDto(Discussion discussion)
        {
            return new DiscussionDto
            {
                Id = discussion.Id,
                Title = discussion.Title,
                Content = discussion.Content,
                ClassId = discussion.ClassId,
                CreatorId = discussion.CreatorId,
                CreatorName = discussion.Creator?.FullName,
                CreatedAt = discussion.CreatedAt,
                UpdatedAt = discussion.UpdatedAt,
                Comments = discussion.Comments?.Select(MapToCommentDto).ToList() ?? new List<CommentDto>()
            };
        }

        private CommentDto MapToCommentDto(Comment comment)
        {
            return new CommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                DiscussionId = comment.DiscussionId,
                UserId = comment.UserId,
                UserName = comment.User?.FullName,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            };
        }
    }
} 