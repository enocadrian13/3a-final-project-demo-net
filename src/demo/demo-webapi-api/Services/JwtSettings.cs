using Microsoft.IdentityModel.Tokens;

namespace demo_webapi_api.Services;

public sealed record JwtSettings(string Issuer, string Audience, SymmetricSecurityKey SigningKey);
