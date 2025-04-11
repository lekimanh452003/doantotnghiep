using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using EduSync.DTOs;
using EduSync.Services;

namespace EduSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService _lessonService;

        public LessonController(ILessonService lessonService)
        {
            _lessonService = lessonService;
        }

        [HttpPost("class/{classId}")]
        public async Task<ActionResult<LessonDto>> CreateLesson(int classId, CreateLessonDto createLessonDto)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _lessonService.CreateLessonAsync(classId, teacherId, createLessonDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<LessonDto>> UpdateLesson(int id, UpdateLessonDto updateLessonDto)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _lessonService.UpdateLessonAsync(id, teacherId, updateLessonDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LessonDto>> GetLesson(int id)
        {
            try
            {
                var response = await _lessonService.GetLessonByIdAsync(id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("class/{classId}")]
        public async Task<ActionResult<List<LessonDto>>> GetClassLessons(int classId)
        {
            try
            {
                var response = await _lessonService.GetClassLessonsAsync(classId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLesson(int id)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                await _lessonService.DeleteLessonAsync(id, teacherId);
                return Ok(new { message = "Lesson deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/attendance")]
        public async Task<ActionResult<LessonDto>> MarkAttendance(int id, List<MarkAttendanceDto> attendances)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _lessonService.MarkAttendanceAsync(id, teacherId, attendances);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<LessonDto>>> GetAllLessons()
        {
            try
            {
                var response = await _lessonService.GetAllLessonsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 