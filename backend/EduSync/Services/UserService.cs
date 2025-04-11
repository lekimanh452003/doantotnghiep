using EduSync.Data;
using EduSync.DTOs;
using EduSync.Models;
using Microsoft.EntityFrameworkCore;
using BC = BCrypt.Net.BCrypt;

namespace EduSync.Services
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllUsers();
        Task<UserDto> GetUserById(int id);
        Task<UserDto> CreateUser(CreateUserDto createUserDto);
        Task<UserDto> UpdateUser(int id, RegisterDto updateUserDto);
        Task<bool> DeleteUser(int id);
        Task<List<UserDto>> GetAllTeachers();
        Task<List<UserDto>> GetAllStudents();
        Task<bool> DeactivateUser(int id);
        Task<bool> ReactivateUser(int id);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        private UserDto MapToDTO(User user)
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

        public async Task<List<UserDto>> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            return users.Select(MapToDTO).ToList();
        }

        public async Task<UserDto> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            return MapToDTO(user);
        }

        public async Task<UserDto> CreateUser(CreateUserDto createUserDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
                throw new InvalidOperationException("Email already exists");

            var user = new User
            {
                Email = createUserDto.Email,
                PasswordHash = BC.HashPassword(createUserDto.Password),
                FullName = createUserDto.FullName,
                PhoneNumber = createUserDto.PhoneNumber,
                Role = createUserDto.Role,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return MapToDTO(user);
        }

        public async Task<UserDto> UpdateUser(int id, RegisterDto updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (updateUserDto.Email != user.Email && 
                await _context.Users.AnyAsync(u => u.Email == updateUserDto.Email))
                throw new InvalidOperationException("Email already exists");

            user.Email = updateUserDto.Email;
            user.FullName = updateUserDto.FullName;
            user.Role = updateUserDto.Role;
            user.PhoneNumber = updateUserDto.PhoneNumber;

            if (!string.IsNullOrEmpty(updateUserDto.Password))
            {
                if (updateUserDto.Password != updateUserDto.ConfirmPassword)
                    throw new InvalidOperationException("Passwords do not match");

                user.PasswordHash = BC.HashPassword(updateUserDto.Password);
            }

            await _context.SaveChangesAsync();

            return MapToDTO(user);
        }

        public async Task<bool> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserDto>> GetAllTeachers()
        {
            var teachers = await _context.Users
                .Where(u => u.Role == UserRole.Teacher && u.IsActive)
                .ToListAsync();
            return teachers.Select(MapToDTO).ToList();
        }

        public async Task<List<UserDto>> GetAllStudents()
        {
            var students = await _context.Users
                .Where(u => u.Role == UserRole.Student && u.IsActive)
                .ToListAsync();
            return students.Select(MapToDTO).ToList();
        }

        public async Task<bool> DeactivateUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReactivateUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            user.IsActive = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 