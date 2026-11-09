using System.ComponentModel.DataAnnotations;

namespace demo_webapi_api.DTOs
{
    public class LoginRequest
    {
        // Accepts either email address or username.
        [Required]
        public string Identifier { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}