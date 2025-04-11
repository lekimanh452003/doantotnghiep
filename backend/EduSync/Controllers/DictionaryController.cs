using Microsoft.AspNetCore.Mvc;
using EduSync.DTOs;
using EduSync.Services;

namespace EduSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DictionaryController : ControllerBase
    {
        private readonly ChatGPTService _chatGPTService;

        public DictionaryController(ChatGPTService chatGPTService)
        {
            _chatGPTService = chatGPTService;
        }

        [HttpPost("lookup")]
        public async Task<IActionResult> LookupWord([FromBody] DictionaryRequestDTO request)
        {
            try
            {
                var result = await _chatGPTService.GetDictionaryEntryAsync(request);
                return Ok(new { response = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while processing your request", details = ex.Message });
            }
        }
    }
} 