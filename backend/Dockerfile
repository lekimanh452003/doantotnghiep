# ------------------------
# Build stage
# ------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file
COPY SyncEdu/SyncEdu.csproj ./SyncEdu/
RUN dotnet restore ./SyncEdu/SyncEdu.csproj

# Copy entire source
COPY . .

WORKDIR /src/SyncEdu

# Build and publish
RUN dotnet publish -c Release -o /app/publish

# ------------------------
# Runtime stage
# ------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 5071
EXPOSE 7104

ENV ASPNETCORE_URLS="http://+:5071;https://+:7104"
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "SyncEdu.dll"]
