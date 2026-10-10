using MailKit.Security;
using MimeKit;
using Temporalio.Activities;

namespace TaskManagerAPI.Workflows;

public sealed class EmailActivities(IConfiguration configuration, ILogger<EmailActivities> logger)
{
    [Activity]
    public async Task SendAsync(EmailMessage input)
    {
        var host = configuration["Smtp:Host"] ?? "mailpit";
        var port = configuration.GetValue("Smtp:Port", 1025);
        var from = configuration["Smtp:From"] ?? "taskmanager@example.test";
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(from));
        message.To.Add(MailboxAddress.Parse(input.To));
        message.Subject = input.Subject;
        message.Body = new TextPart("plain") { Text = input.Body };

        using var client = new MailKit.Net.Smtp.SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.StartTlsWhenAvailable);
        var username = configuration["Smtp:Username"];
        var password = configuration["Smtp:Password"];
        if (!string.IsNullOrWhiteSpace(username))
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException("Smtp:Password is required when Smtp:Username is configured.");
            await client.AuthenticateAsync(username, password);
        }

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
        logger.LogInformation("Email sent to {Recipient} with subject {Subject}", input.To, input.Subject);
    }
}
