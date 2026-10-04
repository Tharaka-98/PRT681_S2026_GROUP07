# ---------- build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TaskManagerAPI.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# ---------- runtime (lightweight Linux base, as per Week 5 prep) ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache curl icu-libs \
    && adduser -D -u 1001 appuser \
    && mkdir -p /app/data \
    && chown -R appuser /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080 \
    DB_PATH=/app/data/tasks.db \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8080/api/health || exit 1

ENTRYPOINT ["dotnet", "TaskManagerAPI.dll"]
