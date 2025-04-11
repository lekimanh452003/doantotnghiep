namespace EduSync.DTOs
{
    public class StudentProgressDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public int TotalAssignments { get; set; }
        public int CompletedAssignments { get; set; }
        public double AssignmentCompletionRate { get; set; }
        public double AverageAssignmentScore { get; set; }
        public int TotalExams { get; set; }
        public int CompletedExams { get; set; }
        public double ExamCompletionRate { get; set; }
        public double AverageExamScore { get; set; }
        public int TotalAttendance { get; set; }
        public int PresentCount { get; set; }
        public double AttendanceRate { get; set; }
        public int TotalDiscussions { get; set; }
        public int TotalComments { get; set; }
    }

    public class ClassStatisticsDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; }
        public int TotalStudents { get; set; }
        public int ActiveStudents { get; set; }
        public double AverageAttendanceRate { get; set; }
        public double AverageAssignmentCompletionRate { get; set; }
        public double AverageAssignmentScore { get; set; }
        public double AverageExamScore { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalAssignments { get; set; }
        public int TotalExams { get; set; }
        public int TotalDiscussions { get; set; }
    }

    public class AttendanceReportDto
    {
        public int LessonId { get; set; }
        public string LessonTitle { get; set; }
        public DateTime LessonDate { get; set; }
        public int TotalStudents { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public double AttendanceRate { get; set; }
        public List<AttendanceDetailDto> Details { get; set; }
    }

    public class AttendanceDetailDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public bool IsPresent { get; set; }
        public string Note { get; set; }
    }

    public class GradeReportDto
    {
        public string Type { get; set; } // "Assignment" or "Exam"
        public int ItemId { get; set; }
        public string ItemTitle { get; set; }
        public DateTime DueDate { get; set; }
        public int TotalStudents { get; set; }
        public int NumberOfSubmissions { get; set; }
        public double SubmissionRate { get; set; }
        public double AverageScore { get; set; }
        public double HighestScore { get; set; }
        public double LowestScore { get; set; }
        public List<GradeDetailDto> Details { get; set; }
    }

    public class GradeDetailDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public bool HasSubmitted { get; set; }
        public DateTime? SubmissionTime { get; set; }
        public double? Score { get; set; }
        public string Feedback { get; set; }
    }

    public class StudyTimeReportDto
    {
        public string StudentName { get; set; }
        public double TotalStudyTime { get; set; }
        public List<StudyTimeDetailDto> Details { get; set; }
    }

    public class StudyTimeDetailDto
    {
        public string Type { get; set; }
        public string ItemTitle { get; set; }
        public double Duration { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public class ExamStatisticsDto
    {
        public int TotalSubmissions { get; set; }
        public double AverageScore { get; set; }
        public List<StudentExamStatisticsDto> StudentStats { get; set; }
    }

    public class StudentExamStatisticsDto
    {
        public string StudentName { get; set; }
        public double Score { get; set; }
        public DateTime SubmissionTime { get; set; }
    }
} 