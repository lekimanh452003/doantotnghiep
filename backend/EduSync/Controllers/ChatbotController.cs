using EduSync.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduSync.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly RasaService _rasaService;

        public ChatbotController(RasaService rasaService)
        {
            _rasaService = rasaService;
        }
        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] MessageRequest request)
        {
            if (string.IsNullOrEmpty(request?.Message))
                return BadRequest("Message cannot be empty!");

            var response = await _rasaService.SendMessageAsync(request.Message);
            return Ok(response);
        }
    }

    public class MessageRequest
    {
        public string Message { get; set; }
    }
}
