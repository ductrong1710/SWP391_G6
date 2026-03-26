using BusinessLogicLayer.DTOs.District;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IDistrictService
    {
        Task<IEnumerable<DistrictResponseDto>> GetAllAsync();
    }
}
