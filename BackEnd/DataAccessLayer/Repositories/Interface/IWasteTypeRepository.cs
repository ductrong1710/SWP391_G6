using DataAccessLayer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interface
{
    public interface IWasteTypeRepository
    {
        Task<IEnumerable<Wastetype>> GetAllAsync();
        Task<Wastetype?> GetByIdAsync(int id);

        Task<bool> NameExistsAsync(string name);
        Task<bool> NameExistsAsync(string name, int excludeWasteTypeId);

        Task AddAsync(Wastetype entity);
        void Update(Wastetype entity);
        Task DeleteAsync(int id);
    }
}

