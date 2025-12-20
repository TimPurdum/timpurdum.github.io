# Dockerfile for testing TimPurdum.Dev Blazor WASM AOT publish locally
# This replicates the GitHub Actions build environment

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

# Install Python (required for WASM AOT compilation in .NET 10)
RUN apt-get update && apt-get install -y python3 && ln -s /usr/bin/python3 /usr/bin/python && rm -rf /var/lib/apt/lists/*

# Install wasm-tools workload required for AOT compilation
RUN dotnet workload install wasm-tools

# Set working directory
WORKDIR /src

# Copy solution and project files for restore
COPY . ./

# Restore all projects
RUN dotnet restore TimPurdum.Dev/TimPurdum.Dev.csproj
RUN dotnet publish -c Release TimPurdum.Dev/TimPurdum.Dev.csproj /p:RunAOT=true -o /app/publish

# Final stage - lightweight image to serve static files
FROM nginx:alpine AS final

# Copy the published wwwroot to nginx
COPY --from=build /app/publish/wwwroot /usr/share/nginx/html

# Copy custom nginx config for SPA routing and compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
