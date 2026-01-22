using DataAccessLayer.Models;

namespace BusinessLogicLayer
{
    public interface IAuthService
    {
        User? Authenticate(string email, string password);
        string GenerateJwtToken(User user);
    }
}