using Microsoft.AspNetCore.Mvc;
using EduSync.Services;
using EduSync.DTOs;

namespace EduSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public ContactController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> SendContactRequest([FromBody] ContactRequestDto request)
        {
            try
            {
                var toEmails = "kimanh01663345754@gmail.com,vovanhung77h12@gmail.com, phamthinguyet18122003@gmail.com";
                var subject = "Yêu cầu tư vấn mới từ EduSync";
                var body = $@"
                    <h2>Thông tin đăng ký tư vấn:</h2>
                    <p><strong>Họ và tên:</strong> {request.FullName}</p>
                    <p><strong>Email:</strong> {request.Email}</p>
                    <p><strong>Số điện thoại:</strong> {request.Phone}</p>
                    {(string.IsNullOrEmpty(request.Message) ? "" : $"<p><strong>Lời nhắn:</strong> {request.Message}</p>")}
                    <p>Vui lòng liên hệ với học viên trong thời gian sớm nhất!</p>
                ";

                await _emailService.SendEmailAsync(toEmails, subject, body);

                return Ok(new { success = true, message = "Đã gửi thông tin thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại!" });
            }
        }
    }
} 