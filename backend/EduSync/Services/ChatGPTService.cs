using System.Net.Http;
using System.Text;
using System.Text.Json;
using EduSync.DTOs;

namespace EduSync.Services
{
    public class ChatGPTService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string API_URL = "https://api.openai.com/v1/chat/completions";

        public ChatGPTService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["ChatGPT:ApiKey"];
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        }

        public async Task<string> GetDictionaryEntryAsync(DictionaryRequestDTO request)
        {
            var prompt = BuildDictionaryPrompt(request);
            var response = await SendChatGPTRequestAsync(prompt);
            return response;
        }

        private string BuildDictionaryPrompt(DictionaryRequestDTO request)
        {
            var prompt = new StringBuilder();
            prompt.AppendLine($"Please provide a comprehensive dictionary entry for the word '{request.Word}':");
            
            if (!string.IsNullOrEmpty(request.Context))
            {
                prompt.AppendLine($"Context: {request.Context}");
            }

            prompt.AppendLine("Please include:");
            if (request.IncludePronunciation)
                prompt.AppendLine("- Pronunciation (both British and American)");
            if (request.IncludeExamples)
                prompt.AppendLine("- Example sentences");
            if (request.IncludeSynonyms)
                prompt.AppendLine("- Synonyms with usage differences");
            if (request.IncludeAntonyms)
                prompt.AppendLine("- Antonyms");
            if (request.IncludeRelatedPhrases)
                prompt.AppendLine("- Related phrases and idioms");

            prompt.AppendLine("\nPlease format the response in a clear, structured way with appropriate sections.");
            return prompt.ToString();
        }

        private async Task<string> SendChatGPTRequestAsync(string prompt)
        {
            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful dictionary assistant that provides comprehensive word definitions, examples, and related information." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.7,
                max_tokens = 1000
            };

            var response = await _httpClient.PostAsync(
                API_URL,
                new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            );

            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var responseObject = JsonSerializer.Deserialize<ChatGPTResponse>(responseContent);

            return responseObject?.Choices?.FirstOrDefault()?.Message?.Content ?? "No response received.";
        }

        private class ChatGPTResponse
        {
            public List<Choice> Choices { get; set; }
        }

        private class Choice
        {
            public Message Message { get; set; }
        }

        private class Message
        {
            public string Content { get; set; }
        }
    }
} 