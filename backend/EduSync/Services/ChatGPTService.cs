using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using EduSync.DTOs;
using Microsoft.Extensions.Logging;

namespace EduSync.Services
{
    public class ChatGPTService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _defaultApiKey;
        private const string API_URL = "https://api.openai.com/v1/chat/completions";

        public ChatGPTService(IConfiguration configuration)
        {
            _configuration = configuration;
            _defaultApiKey = configuration["ChatGPT:ApiKey"];
            _httpClient = new HttpClient();
        }

        public async Task<string> GetDictionaryEntryAsync(DictionaryRequestDTO request)
        {
            var apiKey = _configuration["ChatGPT:DictionaryKey"] ?? _defaultApiKey;
            Console.WriteLine($"DictionaryKey: {apiKey}");

            var prompt = BuildDictionaryPrompt(request);
            var systemRole = "You are an English dictionary that explains words clearly for language learners.";
            return await SendChatGPTRequestAsync(prompt, systemRole, apiKey);
        }

        public async Task<string> GetChatResponseAsync(string message)
        {
            var apiKey = _configuration["ChatGPT:ChatKey"] ?? _defaultApiKey;
            var prompt = $"You are a friendly assistant. Please answer the following question: {message}";
            var systemRole = "You are a helpful assistant.";
            return await SendChatGPTRequestAsync(prompt, systemRole, apiKey);
        }

        public async Task<string> GetTranslationAsync(string textToTranslate, string sourceLanguage, string targetLanguage)
        {
            var apiKey = _configuration["ChatGPT:TranslationKey"] ?? _defaultApiKey;
            var prompt = $"Translate the following text from {sourceLanguage} to {targetLanguage}: {textToTranslate}";
            var systemRole = "You are a professional translator. Translate texts accurately and naturally.";
            return await SendChatGPTRequestAsync(prompt, systemRole, apiKey);
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
            Console.WriteLine("Generated prompt:\n" + prompt.ToString());
            return prompt.ToString();
        }

        private async Task<string> SendChatGPTRequestAsync(string prompt, string systemRole, string apiKey)
        {
            int maxRetries = 3;
            int delayMilliseconds = 1500;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var requestBody = new
                    {
                        model = "gpt-3.5-turbo",
                        messages = new[] {
                        new { role = "system", content = systemRole },
                        new { role = "user", content = prompt }
                    },
                        temperature = 0.7,
                        max_tokens = 1000
                    };

                    using var request = new HttpRequestMessage(HttpMethod.Post, API_URL)
                    {
                        Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
                    };
                    request.Headers.Clear();
                    request.Headers.Add("Authorization", $"Bearer {apiKey}");

                    using var response = await _httpClient.SendAsync(request);

                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests && attempt < maxRetries)
                    {
                        await Task.Delay(delayMilliseconds);
                        continue;
                    }

                    response.EnsureSuccessStatusCode();
                    var json = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<ChatGPTResponse>(json);
                    return result?.Choices?.FirstOrDefault()?.Message?.Content ?? "No response.";
                }
                catch (HttpRequestException ex) when (attempt < maxRetries)
                {
                    await Task.Delay(delayMilliseconds);
                }
            }

            return "Failed to get response after multiple attempts.";
        }

        private class ChatGPTResponse
        {
            [JsonPropertyName("choices")]
            public List<Choice> Choices { get; set; }
        }

        private class Choice
        {
            [JsonPropertyName("message")]
            public Message Message { get; set; }
        }

        private class Message
        {
            [JsonPropertyName("content")]
            public string Content { get; set; }
        }
    }

}