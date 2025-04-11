using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduSync.Services;
using EduSync.DTOs;
using EduSync.Models;
using System.Security.Claims;

namespace EduSync.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;

        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpPost]
        public async Task<ActionResult<ExamDto>> CreateExam([FromBody] CreateExamDto examDto)
        {
            try
            {
                var exam = await _examService.CreateExamAsync(examDto);
                return Ok(exam);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExamDto>> GetExam(int id)
        {
            try
            {
                var exam = await _examService.GetExamByIdAsync(id);
                return Ok(exam);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("class/{classId}")]
        public async Task<ActionResult<List<ExamDto>>> GetExamsByClass(int classId)
        {
            try
            {
                var exams = await _examService.GetExamsByClassIdAsync(classId);
                return Ok(exams);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("submit")]
        public async Task<ActionResult> SubmitExam([FromBody] SubmitExamDto submissionDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var submission = await _examService.SubmitExamAsync(submissionDto, userId);
                return Ok(submission);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{examId}/submissions")]
        public async Task<ActionResult<List<ExamSubmission>>> GetSubmissions(int examId)
        {
            try
            {
                var submissions = await _examService.GetSubmissionsByExamIdAsync(examId);
                return Ok(submissions);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("submission/{submissionId}/grade")]
        public async Task<ActionResult> GradeSubmission(int submissionId, [FromBody] List<AnswerGradeDto> grades)
        {
            try
            {
                var submission = await _examService.GradeSubmissionAsync(submissionId, grades);
                return Ok(submission);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
} 