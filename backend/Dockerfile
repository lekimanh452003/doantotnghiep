# ------------------------
# Build stage
# ------------------------
    FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
    WORKDIR /src
    
    # Copy solution and project files
    COPY *.sln .
    COPY backend/*.csproj ./backend/
    
    # Restore dependencies
    RUN dotnet restore
    
    # Copy the rest of the code
    COPY backend/. ./backend/
    WORKDIR /src/backend
    
    # Build and publish
    RUN dotnet publish -c Release -o /app/publish
    
    # ------------------------
    # Runtime stage
    # ------------------------
    FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
    WORKDIR /app
    
    # Copy build artifacts
    COPY --from=build /app/publish .
    
    # Expose your custom ports
    EXPOSE 5071
    EXPOSE 7104
    
    # Set environment variables
    ENV ASPNETCORE_URLS="http://+:5071;https://+:7104"
    ENV ASPNETCORE_ENVIRONMENT=Production
    
    # Run the app
    ENTRYPOINT ["dotnet", "EduSync.dll"]
    