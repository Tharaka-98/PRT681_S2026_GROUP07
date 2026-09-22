using Temporalio.Client;
using Temporalio.Worker;
using BookstoreWorkflows;

var client = await TemporalClient.ConnectAsync(new TemporalClientConnectOptions
{
    TargetHost = "localhost:7233",
});

using var worker = new TemporalWorker(
    client,
    new TemporalWorkerOptions("bookstore-task-queue")
        .AddWorkflow<ReviewNotificationWorkflow>()
        .AddActivity(new EmailActivities().SendReviewConfirmationEmail));

Console.WriteLine("Worker started. Press Ctrl+C to exit.");
await worker.ExecuteAsync(CancellationToken.None);