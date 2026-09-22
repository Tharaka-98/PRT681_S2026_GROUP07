using Temporalio.Workflows;

namespace BookstoreWorkflows;

[Workflow]
public class ReviewNotificationWorkflow
{
    [WorkflowRun]
    public async Task RunAsync(string reviewerEmail, string bookTitle)
    {
        await Workflow.ExecuteActivityAsync(
            (EmailActivities a) => a.SendReviewConfirmationEmail(reviewerEmail, bookTitle),
            new Temporalio.Workflows.ActivityOptions
            {
                StartToCloseTimeout = TimeSpan.FromSeconds(30),
                RetryPolicy = new Temporalio.Common.RetryPolicy
                {
                    MaximumAttempts = 3,
                },
            });
    }
}