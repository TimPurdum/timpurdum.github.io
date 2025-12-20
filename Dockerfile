# Dockerfile for testing TimPurdum.Dev Blazor WASM AOT publish locally
# This replicates the GitHub Actions build environment

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

# Install wasm-tools workload required for AOT compilation
RUN dotnet workload install wasm-tools

# Set working directory
WORKDIR /src

# Copy solution and project files for restore
COPY TimPurdum.Dev/* ./

# Restore all projects
RUN dotnet restore TimPurdum.Dev.csproj
RUN dotnet build -c Release --no-restore TimPurdum.Dev.csproj
RUN dotnet publish -c Release --no-build -o /app/publish

# Final stage - lightweight image to serve static files
FROM nginx:alpine AS final

# Copy the published wwwroot to nginx
COPY --from=build /app/publish/wwwroot /usr/share/nginx/html

# Copy custom nginx config for SPA routing and compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
