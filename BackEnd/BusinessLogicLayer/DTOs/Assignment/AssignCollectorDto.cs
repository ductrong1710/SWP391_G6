namespace BusinessLogicLayer.DTOs.Assignment
{
    /// <summary>
    /// DTO for assigning a collector to a collection request
    /// </summary>
    public class AssignCollectorDto
    {
        public int RequestId { get; set; }
        public int CollectorId { get; set; }
    }
}
