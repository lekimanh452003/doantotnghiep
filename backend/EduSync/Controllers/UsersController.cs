using Microsoft.AspNetCore.Mvc;
using EduSync.Services;
using EduSync.DTOs;
using EduSync.Models;
using Microsoft.AspNetCore.Authorization;

namespace EduSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetUserById(id);
                return Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("User not found");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                var user = await _userService.CreateUser(createUserDto);
                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] RegisterDto updateUserDto)
        {
            try
            {
                var user = await _userService.UpdateUser(id, updateUserDto);
                return Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("User not found");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUser(id);
            if (!result)
                return NotFound("User not found");

            return NoContent();
        }

        [HttpGet("teachers")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<List<UserDto>>> GetAllTeachers()
        {
            var teachers = await _userService.GetAllTeachers();
            return Ok(teachers);
        }

        [HttpGet("students")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<List<UserDto>>> GetAllStudents()
        {
            var students = await _userService.GetAllStudents();
            return Ok(students);
        }

        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeactivateUser(int id)
        {
            var result = await _userService.DeactivateUser(id);
            if (!result)
                return NotFound("User not found");

            return NoContent();
        }

        [HttpPut("{id}/reactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ReactivateUser(int id)
        {
            var result = await _userService.ReactivateUser(id);
            if (!result)
                return NotFound("User not found");

            return NoContent();
        }
    }
} 