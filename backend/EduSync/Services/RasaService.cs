using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text;
using System.Text.Json.Serialization;

namespace EduSync.Services
{
    public class RasaService
    {
        private readonly HttpClient _httpClient;

        public RasaService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("http://localhost:5005/");
        }

        public async Task<string> SendMessageAsync(string message)
        {
            var requestBody = new
            {
                sender = "user",
                message = message
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync("webhooks/rest/webhook", jsonContent);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Lỗi: {response.StatusCode}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(jsonResponse) || jsonResponse == "[]")
            {
                return "Không có phản hồi từ chatbot";
            }

            try
            {
                // Dùng JsonSerializerOptions với Unicode decoding
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };

                var responseData = JsonSerializer.Deserialize<List<RasaResponse>>(jsonResponse, options);
                return responseData?.FirstOrDefault()?.Text ?? "Không có phản hồi";
            }
            catch (Exception ex)
            {
                return "Lỗi xử lý phản hồi từ chatbot";
            }

        }
        // Lớp để ánh xạ JSON phản hồi từ Rasa
        public class RasaResponse
        {
            [JsonPropertyName("recipient_id")]//không ánh xạ đúng tên "recipient_id" và "text",  dùng [JsonPropertyName] để chỉ định rõ.
            public string RecipientId { get; set; }

            [JsonPropertyName("text")]
            public string Text { get; set; }
        }

    }
}
