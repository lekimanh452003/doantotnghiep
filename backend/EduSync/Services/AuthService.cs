using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using EduSync.Data;
using EduSync.DTOs;
using EduSync.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace EduSync.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> UpdateUserAsync(UpdateUserDto updateUserDto);

    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new Exception("Email already exists");
            }

            var user = new User
            {
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                FullName = registerDto.FullName,
                PhoneNumber = registerDto.PhoneNumber,
                Role = registerDto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                Token = GenerateJwtToken(user),
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                throw new Exception("Invalid email or password");
            }

            return new AuthResponseDto
            {
                Token = GenerateJwtToken(user),
                User = MapToUserDto(user)
            };
        }
        public async Task<AuthResponseDto> UpdateUserAsync(UpdateUserDto updateUserDto)
        {
            var user = await _context.Users.FindAsync(updateUserDto.Id);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            user.FullName = updateUserDto.FullName;
            user.PhoneNumber = updateUserDto.PhoneNumber;
            user.Avatar = updateUserDto.Avatar;

            var passwordChanged = false;

            if (!string.IsNullOrWhiteSpace(updateUserDto.NewPassword))
            {
                if (string.IsNullOrWhiteSpace(updateUserDto.CurrentPassword) ||
                    !BCrypt.Net.BCrypt.Verify(updateUserDto.CurrentPassword, user.PasswordHash))
                {
                    throw new Exception("Mật khẩu hiện tại của bạn không đúng");
                }

                if (updateUserDto.NewPassword != updateUserDto.ConfirmNewPassword)
                {
                    throw new Exception("Mật khẩu mới nhập lại không khớp");
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateUserDto.NewPassword);
                passwordChanged = true;
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                Token = passwordChanged ? GenerateJwtToken(user) : null, // chỉ tạo mới nếu cần
                User = MapToUserDto(user)
            };
        }


        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                Avatar = user.Avatar
            };
        }
    }
} 