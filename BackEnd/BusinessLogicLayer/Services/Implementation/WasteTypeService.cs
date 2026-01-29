using BusinessLogicLayer.DTOs.WasteType;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class WasteTypeService : IWasteTypeService
    {
        private readonly IUnitOfWork _uow;

        public WasteTypeService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<IEnumerable<Wastetype>> GetAllAsync()
        {
            return await _uow.WasteTypes.GetAllAsync();
        }

        public async Task<Wastetype?> GetByIdAsync(int id)
        {
            return await _uow.WasteTypes.GetByIdAsync(id);
        }

        public async Task<Wastetype> CreateAsync(CreateWasteTypeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Name is required");
            }

            if (await _uow.WasteTypes.NameExistsAsync(dto.Name))
            {
                throw new InvalidOperationException("WasteType name already exists");
            }

            var entity = new Wastetype
            {
                Name = dto.Name,
                Description = dto.Description
            };

            await _uow.WasteTypes.AddAsync(entity);
            await _uow.SaveChangesAsync();

            return entity;
        }

        public async Task<Wastetype> UpdateAsync(int id, UpdateWasteTypeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Name is required");
            }

            var existing = await _uow.WasteTypes.GetByIdAsync(id);
            if (existing == null)
            {
                throw new InvalidOperationException("WasteType not found");
            }

            if (await _uow.WasteTypes.NameExistsAsync(dto.Name, id))
            {
                throw new InvalidOperationException("WasteType name already exists");
            }

            existing.Name = dto.Name;
            existing.Description = dto.Description;

            _uow.WasteTypes.Update(existing);
            await _uow.SaveChangesAsync();

            return existing;
        }

        public async Task DeleteAsync(int id)
        {
            var existing = await _uow.WasteTypes.GetByIdAsync(id);
            if (existing == null)
            {
                throw new InvalidOperationException("WasteType not found");
            }

            await _uow.WasteTypes.DeleteAsync(id);
            await _uow.SaveChangesAsync();
        }
    }
}

