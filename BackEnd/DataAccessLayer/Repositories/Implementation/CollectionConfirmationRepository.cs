using DataAccessLayer.Data;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementation
{
    public class CollectionConfirmationRepository : ICollectionConfirmationRepository
    {
        private readonly AppDbContext _context;

        public CollectionConfirmationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Collectionconfirmation entity)
        {
            await _context.Collectionconfirmations.AddAsync(entity);
        }

        public async Task<Collectionconfirmation?> GetByAssignmentIdAsync(int assignmentId)
        {
            return await _context.Collectionconfirmations
                .FirstOrDefaultAsync(x => x.AssignmentId == assignmentId);
        }
    }
}
