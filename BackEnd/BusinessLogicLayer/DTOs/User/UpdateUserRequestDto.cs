<<<<<<< HEAD
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

=======
>>>>>>> 8a370204f4390a9bd8056ea36986c0f2cfb25ab3
namespace BusinessLogicLayer.DTOs.User
{
    public class UpdateUserRequestDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}