using DataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interface
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> PhoneExistsAsync(string phone);
        Task AddAsync(User user);
        Task<IEnumerable<User>> GetAllAsync();
        void Update(User user);
        void Delete(User user);
        Task<bool> EmailExistsExceptAsync(string email, int excludeUserId);
        Task<bool> PhoneExistsExceptAsync(string phone, int excludeUserId);
    }
}