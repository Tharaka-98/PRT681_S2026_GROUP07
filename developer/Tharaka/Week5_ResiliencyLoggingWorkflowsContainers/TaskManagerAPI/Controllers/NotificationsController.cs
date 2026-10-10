using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using TaskManagerAPI.Workflows;
using Temporalio.Client;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/notifications")]
public sealed class NotificationsController(IConfiguration configuration) : ControllerBase
{
    [HttpPost("email")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public async Task<IActionResult> QueueEmail([FromBody] QueueEmailRequest request, CancellationToken cancellationToken)
    {
        var temporal = await TemporalClient.ConnectAsync(new TemporalClientConnectOptions(
            configuration["Temporal:Address"] ?? "temporal:7233"));
        var workflowId = $"email-{Guid.NewGuid():N}";
        await temporal.StartWorkflowAsync(
            (EmailDispatchWorkflow workflow) => workflow.RunAsync(
                new EmailMessage(request.To, request.Subject, request.Body)),
            new(id: workflowId, taskQueue: "taskmanager-email"));

        return Accepted(new { workflowId, status = "queued" });
    }
}

public sealed class QueueEmailRequest
{
    [Required, EmailAddress, MaxLength(254)]
    public string To { get; init; } = string.Empty;

    [Required, MaxLength(200)]
    public string Subject { get; init; } = string.Empty;

    [Required, MaxLength(10000)]
    public string Body { get; init; } = string.Empty;
}
