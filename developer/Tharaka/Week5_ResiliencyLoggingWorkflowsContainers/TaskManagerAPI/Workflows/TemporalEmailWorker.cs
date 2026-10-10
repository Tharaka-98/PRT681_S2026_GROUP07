using Temporalio.Client;
using Temporalio.Worker;

namespace TaskManagerAPI.Workflows;

public sealed class TemporalEmailWorker(
    IConfiguration configuration,
    EmailActivities activities,
    ILogger<TemporalEmailWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var target = configuration["Temporal:Address"] ?? "temporal:7233";
        var client = await TemporalClient.ConnectAsync(new TemporalClientConnectOptions(target));
        var options = new TemporalWorkerOptions("taskmanager-email");
        options.AddWorkflow<EmailDispatchWorkflow>();
        options.AddAllActivities(activities);

        using var worker = new TemporalWorker(client, options);
        logger.LogInformation("Temporal email worker polling task queue {TaskQueue} at {Target}", "taskmanager-email", target);
        await worker.ExecuteAsync(stoppingToken);
    }
}
