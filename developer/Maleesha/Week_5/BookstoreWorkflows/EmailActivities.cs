using MailKit.Net.Smtp;
using MimeKit;
using Temporalio.Activities;

namespace BookstoreWorkflows;

public class EmailActivities
{
    [Activity]
    public async Task SendReviewConfirmationEmail(string toEmail, string bookTitle)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("The Ink & Page", "noreply@inkandpage.com"));
        message.To.Add(new MailboxAddress("Reviewer", toEmail));
        message.Subject = $"Thanks for reviewing \"{bookTitle}\"!";
        message.Body = new TextPart("plain")
        {
            Text = $"Hi,\n\nThanks for submitting your review of \"{bookTitle}\". We appreciate your feedback!\n\n- The Ink & Page"
        };

        using var client = new SmtpClient();
        // For local testing without a real SMTP server, use a tool like smtp4dev or Papercut
        await client.ConnectAsync("localhost", 2525, false);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        Console.WriteLine($"Email sent to {toEmail} for review of {bookTitle}");
    }
}