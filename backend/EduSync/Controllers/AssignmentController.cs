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
    public class AssignmentController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentController(IAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        [HttpPost("class/{classId}")]
        public async Task<ActionResult<AssignmentDto>> CreateAssignment(int classId, CreateAssignmentDto createAssignmentDto)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _assignmentService.CreateAssignmentAsync(classId, teacherId, createAssignmentDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AssignmentDto>> UpdateAssignment(int id, UpdateAssignmentDto updateAssignmentDto)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _assignmentService.UpdateAssignmentAsync(id, teacherId, updateAssignmentDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AssignmentDto>> GetAssignment(int id)
        {
            try
            {
                var response = await _assignmentService.GetAssignmentByIdAsync(id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("class/{classId}")]
        public async Task<ActionResult<List<AssignmentDto>>> GetClassAssignments(int classId)
        {
            try
            {
                var response = await _assignmentService.GetClassAssignmentsAsync(classId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAssignment(int id)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                await _assignmentService.DeleteAssignmentAsync(id, teacherId);
                return Ok(new { message = "Assignment deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/submit")]
        public async Task<ActionResult<AssignmentDto>> SubmitAssignment(int id, SubmitAssignmentDto submitAssignmentDto)
        {
            try
            {
                var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _assignmentService.SubmitAssignmentAsync(id, studentId, submitAssignmentDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/submissions/{submissionId}/grade")]
        public async Task<ActionResult<AssignmentDto>> GradeSubmission(int id, int submissionId, GradeSubmissionDto gradeSubmissionDto)
        {
            try
            {
                var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var response = await _assignmentService.GradeSubmissionAsync(id, submissionId, teacherId, gradeSubmissionDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<AssignmentDto>>> GetAllAssignments()
        {
            try
            {
                var response = await _assignmentService.GetAllAssignmentsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 