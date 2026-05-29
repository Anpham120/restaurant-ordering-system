FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Restaurant.Api/Restaurant.Api.csproj", "src/Restaurant.Api/"]
COPY ["src/Restaurant.Application/Restaurant.Application.csproj", "src/Restaurant.Application/"]
COPY ["src/Restaurant.Domain/Restaurant.Domain.csproj", "src/Restaurant.Domain/"]
COPY ["src/Restaurant.Infrastructure/Restaurant.Infrastructure.csproj", "src/Restaurant.Infrastructure/"]
RUN dotnet restore "src/Restaurant.Api/Restaurant.Api.csproj"
COPY . .
WORKDIR "/src/src/Restaurant.Api"
RUN dotnet publish "Restaurant.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Restaurant.Api.dll"]
