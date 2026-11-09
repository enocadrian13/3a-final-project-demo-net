using demo_webapi_api.DTOs;

namespace demo_webapi_api.Services;

public interface IAuthService
{
    Task<IResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<IResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
}
