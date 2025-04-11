using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduSync.Services;
using EduSync.DTOs;
using System.Security.Claims;

namespace EduSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DiscussionController : ControllerBase
    {
        private readonly IDiscussionService _discussionService;

        public DiscussionController(IDiscussionService discussionService)
        {
            _discussionService = discussionService;
        }

        [HttpPost]
        public async Task<ActionResult<DiscussionDto>> CreateDiscussion(CreateDiscussionDto createDiscussionDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var discussion = await _discussionService.CreateDiscussionAsync(userId, createDiscussionDto);
                return Ok(discussion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DiscussionDto>> UpdateDiscussion(int id, UpdateDiscussionDto updateDiscussionDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var discussion = await _discussionService.UpdateDiscussionAsync(id, userId, updateDiscussionDto);
                return Ok(discussion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DiscussionDto>> GetDiscussion(int id)
        {
            try
            {
                var discussion = await _discussionService.GetDiscussionByIdAsync(id);
                return Ok(discussion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("class/{classId}")]
        public async Task<ActionResult<List<DiscussionDto>>> GetClassDiscussions(int classId)
        {
            try
            {
                var discussions = await _discussionService.GetClassDiscussionsAsync(classId);
                return Ok(discussions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDiscussion(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                await _discussionService.DeleteDiscussionAsync(id, userId);
                return Ok(new { message = "Discussion deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("comment")]
        public async Task<ActionResult<CommentDto>> AddComment(CreateCommentDto createCommentDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var comment = await _discussionService.AddCommentAsync(userId, createCommentDto);
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("comment/{id}")]
        public async Task<ActionResult<CommentDto>> UpdateComment(int id, UpdateCommentDto updateCommentDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var comment = await _discussionService.UpdateCommentAsync(id, userId, updateCommentDto);
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("comment/{id}")]
        public async Task<ActionResult> DeleteComment(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                await _discussionService.DeleteCommentAsync(id, userId);
                return Ok(new { message = "Comment deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<DiscussionDto>>> GetAllDiscussions()
        {
            try
            {
                var discussions = await _discussionService.GetAllDiscussionsAsync();
                return Ok(discussions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 