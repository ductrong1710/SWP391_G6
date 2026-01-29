using BusinessLogicLayer.Identity;
using BusinessLogicLayer.Services.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail,string subject,string body,bool isHtml = false)
        {
            var smtp = _configuration.GetSection("SmtpSettings");

            var client = new SmtpClient(smtp["Host"], int.Parse(smtp["Port"]!))
            {
                Credentials = new NetworkCredential(
                    smtp["Username"],
                    smtp["Password"]
                ),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(smtp["Username"]!, smtp["FromName"]),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };

            mail.To.Add(toEmail);
            await client.SendMailAsync(mail);
        }
    }
}
