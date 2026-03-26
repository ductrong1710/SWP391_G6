using BusinessLogicLayer.DTOs.WasteType;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class WasteTypeService : IWasteTypeService
    {
        private readonly IUnitOfWork _uow;

        public WasteTypeService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<IEnumerable<Wastetype>> GetAllAsync(bool onlyActive = true)
        {
            var allWasteTypes = await _uow.WasteTypes.GetAllAsync();

            if (onlyActive)
            {
                return allWasteTypes.Where(wt => wt.IsActive).ToList();
            }

            return allWasteTypes;
        }

        public async Task<Wastetype?> GetByIdAsync(int id)
        {
            return await _uow.WasteTypes.GetByIdAsync(id);
        }

        public async Task<Wastetype> CreateAsync(CreateWasteTypeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Name is required");

            if (dto.RewardPoints < 0)
                throw new ArgumentException("Reward points must be greater than or equal to 0");

            var normalizedName = dto.Name.Trim();

            if (await _uow.WasteTypes.NameExistsAsync(normalizedName))
                throw new InvalidOperationException("WasteType name already exists");

            var entity = new Wastetype
            {
                Name = normalizedName,
                Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
                RewardPoints = dto.RewardPoints,
                IsActive = true
            };

            await _uow.WasteTypes.AddAsync(entity);
            await _uow.SaveChangesAsync();

            return entity;
        }

        public async Task<Wastetype> UpdateAsync(int id, UpdateWasteTypeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Name is required");

            if (dto.RewardPoints < 0)
                throw new ArgumentException("Reward points must be greater than or equal to 0");

            var existing = await _uow.WasteTypes.GetByIdAsync(id);
            if (existing == null)
                throw new InvalidOperationException("WasteType not found");

            var normalizedName = dto.Name.Trim();

            if (await _uow.WasteTypes.NameExistsAsync(normalizedName, id))
                throw new InvalidOperationException("WasteType name already exists");

            existing.Name = normalizedName;
            existing.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
            existing.RewardPoints = dto.RewardPoints;

            if (dto.IsActive.HasValue)
            {
                existing.IsActive = dto.IsActive.Value;
            }

            _uow.WasteTypes.Update(existing);
            await _uow.SaveChangesAsync();

            return existing;
        }

        public async Task DeleteAsync(int id)
        {
            var existing = await _uow.WasteTypes.GetByIdAsync(id);
            if (existing == null)
                throw new InvalidOperationException("WasteType not found");

            existing.IsActive = false;
            _uow.WasteTypes.Update(existing);
            await _uow.SaveChangesAsync();
        }
    }
}
