using System.ComponentModel.DataAnnotations;

namespace EduSync.DTOs
{
    public class DictionaryRequestDTO
    {
        [Required]
        public string Word { get; set; }
        public string Context { get; set; }
        public bool IncludePronunciation { get; set; } = true;
        public bool IncludeExamples { get; set; } = true;
        public bool IncludeSynonyms { get; set; } = true;
        public bool IncludeAntonyms { get; set; } = true;
        public bool IncludeRelatedPhrases { get; set; } = true;
    }
} 