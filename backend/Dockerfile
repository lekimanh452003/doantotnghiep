# ------------------------
# Build stage
# ------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj - Fix the path to match your actual directory structure
COPY EduSync/EduSync.csproj ./EduSync/
RUN dotnet restore ./EduSync/EduSync.csproj

# Copy the entire source code
COPY . .
WORKDIR /src/EduSync

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
ENTRYPOINT ["dotnet", "EduSync.dll"]