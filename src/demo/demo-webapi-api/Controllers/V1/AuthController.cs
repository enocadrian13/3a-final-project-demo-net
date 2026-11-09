using System.IdentityModel.Tokens.Jwt;
using demo_webapi_api.DTOs;
using demo_webapi_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace demo_webapi_api.Controllers.V1;

[ApiController]
[Route("api/auth")]
[Tags("Authentication")]
public class AuthController : ControllerBase
{
    private readonly IAuthService authService;

    public AuthController(IAuthService authService)
    {
        this.authService = authService;
    }

    [HttpPost("register", Name = "Register")]
    public Task<IResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        return authService.RegisterAsync(request, cancellationToken);
    }

    [HttpPost("login", Name = "Login")]
    public Task<IResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        return authService.LoginAsync(request, cancellationToken);
    }

    [HttpGet("me")]
    [Authorize(Policy = "UserOrAdmin")]
    public IResult Me()
    {
        return Results.Ok(new
        {
            userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value,
            username = User.FindFirst(JwtRegisteredClaimNames.UniqueName)?.Value,
            email = User.FindFirst(JwtRegisteredClaimNames.Email)?.Value,
            fullName = User.FindFirst(JwtRegisteredClaimNames.Name)?.Value,
            role = User.FindFirst("role")?.Value
        });
    }
}
