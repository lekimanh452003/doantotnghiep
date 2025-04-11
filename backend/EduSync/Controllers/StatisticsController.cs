using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduSync.Services;
using EduSync.DTOs;

namespace EduSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        [HttpGet("student-progress/{classId}/{studentId}")]
        public async Task<ActionResult<StudentProgressDto>> GetStudentProgress(int classId, int studentId)
        {
            try
            {
                var progress = await _statisticsService.GetStudentProgressAsync(classId, studentId);
                return Ok(progress);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("class-statistics/{classId}")]
        public async Task<ActionResult<ClassStatisticsDto>> GetClassStatistics(int classId)
        {
            try
            {
                var statistics = await _statisticsService.GetClassStatisticsAsync(classId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("attendance-report/{lessonId}")]
        public async Task<ActionResult<AttendanceReportDto>> GetAttendanceReport(int lessonId)
        {
            try
            {
                var report = await _statisticsService.GetAttendanceReportAsync(lessonId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("assignment-grade-report/{assignmentId}")]
        public async Task<ActionResult<GradeReportDto>> GetAssignmentGradeReport(int assignmentId)
        {
            try
            {
                var report = await _statisticsService.GetAssignmentGradeReportAsync(assignmentId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("exam-grade-report/{examId}")]
        public async Task<ActionResult<GradeReportDto>> GetExamGradeReport(int examId)
        {
            try
            {
                var report = await _statisticsService.GetExamGradeReportAsync(examId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("study-time-report/{classId}/{studentId}")]
        public async Task<ActionResult<StudyTimeReportDto>> GetStudyTimeReport(int classId, int studentId)
        {
            try
            {
                var report = await _statisticsService.GetStudyTimeReportAsync(classId, studentId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 