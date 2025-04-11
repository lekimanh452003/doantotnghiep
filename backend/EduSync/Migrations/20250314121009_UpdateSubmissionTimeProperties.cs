using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduSync.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSubmissionTimeProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SubmitTime",
                table: "ExamSubmissions",
                newName: "SubmissionStartTime");

            migrationBuilder.RenameColumn(
                name: "StartTime",
                table: "ExamSubmissions",
                newName: "CreatedAt");

            migrationBuilder.AddColumn<int>(
                name: "LessonId",
                table: "Resources",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Feedback",
                table: "ExamSubmissions",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmissionEndTime",
                table: "ExamSubmissions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Attendances",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Attendances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Attendances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "AssignmentSubmissions",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                table: "AssignmentSubmissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmissionEndTime",
                table: "AssignmentSubmissions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmissionStartTime",
                table: "AssignmentSubmissions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Resources_LessonId",
                table: "Resources",
                column: "LessonId");

            migrationBuilder.AddForeignKey(
                name: "FK_Resources_Lessons_LessonId",
                table: "Resources",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resources_Lessons_LessonId",
                table: "Resources");

            migrationBuilder.DropIndex(
                name: "IX_Resources_LessonId",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "LessonId",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "SubmissionEndTime",
                table: "ExamSubmissions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "AssignmentSubmissions");

            migrationBuilder.DropColumn(
                name: "FileUrl",
                table: "AssignmentSubmissions");

            migrationBuilder.DropColumn(
                name: "SubmissionEndTime",
                table: "AssignmentSubmissions");

            migrationBuilder.DropColumn(
                name: "SubmissionStartTime",
                table: "AssignmentSubmissions");

            migrationBuilder.RenameColumn(
                name: "SubmissionStartTime",
                table: "ExamSubmissions",
                newName: "SubmitTime");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "ExamSubmissions",
                newName: "StartTime");

            migrationBuilder.AlterColumn<string>(
                name: "Feedback",
                table: "ExamSubmissions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
