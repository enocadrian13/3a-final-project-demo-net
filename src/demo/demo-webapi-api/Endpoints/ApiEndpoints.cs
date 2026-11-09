using System.Security.Claims;

namespace demo_webapi_api.Endpoints;

public static class ApiEndpoints
{
    public static void MapApiEndpoints(this WebApplication app)
    {
        app.MapGet("/api/admin/dashboard", (ClaimsPrincipal principal) =>
            Results.Ok(new
            {
                message = "Welcome to the admin dashboard.",
                role = principal.FindFirst("role")?.Value
            }))
        .RequireAuthorization("AdminOnly")
        .WithTags("Administration");

        app.MapGet("/", () => Results.Ok(new
        {
            application = "MinimalAuthApi",
            database = "SQL Server",
            status = "Running"
        }));
    }
}
