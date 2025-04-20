using EduSync.DTOs;
using EduSync.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduSync.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ChatbotController : ControllerBase
    {
        private readonly ChatGPTService _chatGptService;

        public ChatbotController(ChatGPTService chatGptService)
        {
            _chatGptService = chatGptService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> ChatWithAssistant([FromBody] ChatbotDTO request)
        {
            var answer = await _chatGptService.GetAssistantResponseAsync(request.Question);
            return Ok(new { answer });
        }
    }

   
}
