using System.Net;
using System.Net.Mail;

namespace EduSync.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;

        public EmailService(IConfiguration configuration)
        {
            _smtpHost = "smtp-relay.brevo.com";
            _smtpPort = 587;
            _smtpUsername = "h5studiogl@gmail.com";
            _smtpPassword = "fScdnZ4WmEDqjBA1";
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(_smtpUsername),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            // Thêm nhiều địa chỉ email nhận
            foreach (var email in toEmail.Split(',').Select(e => e.Trim()))
            {
                message.To.Add(email);
            }

            await client.SendMailAsync(message);
        }
    }
} 