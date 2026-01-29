using DataAccessLayer.Data;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class WasteTypeRepository : IWasteTypeRepository
    {
        private readonly AppDbContext _context;

        public WasteTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Wastetype>> GetAllAsync()
        {
            return await _context.Wastetypes
                .OrderBy(x => x.WasteTypeId)
                .ToListAsync();
        }

        public async Task<Wastetype?> GetByIdAsync(int id)
        {
            return await _context.Wastetypes
                .FirstOrDefaultAsync(x => x.WasteTypeId == id);
        }

        public async Task<bool> NameExistsAsync(string name)
        {
            return await _context.Wastetypes
                .AnyAsync(x => x.Name == name);
        }

        public async Task<bool> NameExistsAsync(string name, int excludeWasteTypeId)
        {
            return await _context.Wastetypes
                .AnyAsync(x => x.Name == name && x.WasteTypeId != excludeWasteTypeId);
        }

        public async Task AddAsync(Wastetype entity)
        {
            await _context.Wastetypes.AddAsync(entity);
        }

        public void Update(Wastetype entity)
        {
            _context.Wastetypes.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Wastetypes
                .FirstOrDefaultAsync(x => x.WasteTypeId == id);

            if (entity != null)
            {
                _context.Wastetypes.Remove(entity);
            }
        }
    }
}

