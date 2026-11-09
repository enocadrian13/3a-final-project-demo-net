using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using demo_webapi_api.Data;
using demo_webapi_api.DTOs;
using demo_webapi_api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace demo_webapi_api.Services;

public sealed class AuthService : IAuthService
{
    private readonly AppDbContext db;
    private readonly IPasswordHasher<User> passwordHasher;
    private readonly JwtSettings jwt;

    public AuthService(AppDbContext db, IPasswordHasher<User> passwordHasher, JwtSettings jwt)
    {
        this.db = db;
        this.passwordHasher = passwordHasher;
        this.jwt = jwt;
    }

    public async Task<IResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim().ToLowerInvariant();
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(user =>
            user.Username == username || user.Email == email, cancellationToken))
        {
            return DuplicateUser();
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Username = username,
            Email = email,
            Role = "User"
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        db.Users.Add(user);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (exception.InnerException is SqlException { Number: 2601 or 2627 })
        {
            return DuplicateUser();
        }

        return Results.Created($"/api/users/{user.Id}", new
        {
            message = "Registration successful.",
            user.Id,
            user.FullName,
            user.Username,
            user.Email,
            user.Role
        });
    }

    public async Task<IResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var identifier = request.Identifier.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(user =>
            user.Email == identifier || user.Username == identifier, cancellationToken);

        if (user is null)
        {
            return InvalidCredentials();
        }

        var passwordResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return InvalidCredentials();
        }

        if (passwordResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            await db.SaveChangesAsync(cancellationToken);
        }

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.FullName),
            new("role", user.Role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expiresAt = DateTime.UtcNow.AddMinutes(60);
        var credentials = new SigningCredentials(jwt.SigningKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwt.Issuer,
            audience: jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return Results.Ok(new AuthResponse
        {
            Message = "Login successful.",
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt
        });
    }

    private static IResult DuplicateUser()
    {
        return Results.Conflict(new { message = "Username or email is already registered." });
    }

    private static IResult InvalidCredentials()
    {
        return Results.Json(
            new { message = "Invalid username/email or password." },
            statusCode: StatusCodes.Status401Unauthorized);
    }
}
