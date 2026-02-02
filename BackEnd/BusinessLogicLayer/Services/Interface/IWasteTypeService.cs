using BusinessLogicLayer.DTOs.WasteType;
using DataAccessLayer.Models;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IWasteTypeService
    {
        Task<IEnumerable<Wastetype>> GetAllAsync();
        Task<Wastetype?> GetByIdAsync(int id);

        Task<Wastetype> CreateAsync(CreateWasteTypeDto dto);
        Task<Wastetype> UpdateAsync(int id, UpdateWasteTypeDto dto);
        Task DeleteAsync(int id);
    }
}

