using Temporalio.Workflows;

namespace TaskManagerAPI.Workflows;

public sealed record EmailMessage(string To, string Subject, string Body);

[Workflow]
public class EmailDispatchWorkflow
{
    [WorkflowRun]
    public Task RunAsync(EmailMessage message) => Workflow.ExecuteActivityAsync(
        (EmailActivities activities) => activities.SendAsync(message),
        new ActivityOptions
        {
            StartToCloseTimeout = TimeSpan.FromMinutes(2),
            RetryPolicy = new Temporalio.Common.RetryPolicy
            {
                InitialInterval = TimeSpan.FromSeconds(2),
                MaximumInterval = TimeSpan.FromMinutes(1),
                MaximumAttempts = 5
            }
        });
}
