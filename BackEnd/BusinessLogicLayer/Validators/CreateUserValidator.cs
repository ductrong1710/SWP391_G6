using BusinessLogicLayer.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;

namespace BusinessLogicLayer.Validators
{
    public class CreateUserValidator : AbstractValidator<CreateUserRequestDto>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100);

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
                .Matches(@"[\W_]").WithMessage("Password must contain at least one special character");

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MaximumLength(100);

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone is required")
                .Matches(@"^(0|\+84)[0-9]{9,10}$").WithMessage("Invalid Vietnamese phone format")
                .MaximumLength(20);

            RuleFor(x => x.RoleId)
                .GreaterThan(0).WithMessage("Valid role is required");
        }
    }
}
