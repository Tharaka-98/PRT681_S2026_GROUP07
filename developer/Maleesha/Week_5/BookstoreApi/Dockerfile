# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

COPY BookstoreApi/*.csproj ./BookstoreApi/
COPY BookstoreWorkflows/*.csproj ./BookstoreWorkflows/
RUN dotnet restore ./BookstoreApi/BookstoreApi.csproj

COPY BookstoreApi/. ./BookstoreApi/
COPY BookstoreWorkflows/. ./BookstoreWorkflows/
RUN dotnet publish ./BookstoreApi/BookstoreApi.csproj -c Release -o /app/publish

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app

RUN apk add --no-cache icu-libs icu-data-full
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "BookstoreApi.dll"]