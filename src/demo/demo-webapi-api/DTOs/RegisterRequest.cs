using System.ComponentModel.DataAnnotations;
namespace demo_webapi_api.DTOs
{
    public class RegisterRequest
    {
        [Required, StringLength(100, MinimumLength = 2)]
        public string FullName { get; set; } = string.Empty;
        [Required, RegularExpression(@"^[a-zA-Z0-9_]{3,50}$")]
         public string Username { get; set; } = string.Empty;
        [Required, EmailAddress, MaxLength(256)]
        public string Email { get; set; } = string.Empty;
        [Required, MinLength(8), MaxLength(128)]
        public string Password { get; set; } = string.Empty;
    }
}