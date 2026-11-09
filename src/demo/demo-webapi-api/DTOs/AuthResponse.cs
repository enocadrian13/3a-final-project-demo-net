using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace demo_webapi_api.DTOs
{
    public class AuthResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}