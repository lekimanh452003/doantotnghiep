import axios from 'axios';

const API_URL = 'https://api.openai.com/v1/chat/completions';

export const dictionaryService = {
  lookupWord: async (word, context = '', translateDirection = 'en-vi') => {
    try {
      const isEnToVi = translateDirection === 'en-vi';
      const systemPrompt = isEnToVi
        ? "Bạn là một trợ lý từ điển Anh-Việt thông minh, chuyên cung cấp thông tin chi tiết về từ vựng tiếng Anh và dịch nghĩa sang tiếng Việt."
        : "Bạn là một trợ lý từ điển Việt-Anh thông minh, chuyên cung cấp thông tin chi tiết về từ vựng tiếng Việt và dịch nghĩa sang tiếng Anh.";

      const userPrompt = isEnToVi
        ? `Hãy cung cấp thông tin chi tiết về từ tiếng Anh "${word}"${context ? ` trong ngữ cảnh: ${context}` : ''}. Bao gồm:
          1. Định nghĩa (tiếng Việt)
          2. Phát âm (phiên âm quốc tế)
          3. Ví dụ câu (kèm dịch tiếng Việt)
          4. Từ đồng nghĩa (tiếng Anh)
          5. Từ trái nghĩa (tiếng Anh)
          6. Các cụm từ liên quan (kèm dịch tiếng Việt)`
        : `Hãy cung cấp thông tin chi tiết về từ tiếng Việt "${word}"${context ? ` trong ngữ cảnh: ${context}` : ''}. Bao gồm:
          1. Nghĩa tiếng Anh
          2. Cách phát âm tiếng Anh
          3. Ví dụ câu (tiếng Việt và tiếng Anh)
          4. Từ đồng nghĩa (tiếng Việt và tiếng Anh)
          5. Từ trái nghĩa (tiếng Việt và tiếng Anh)
          6. Các cụm từ liên quan (tiếng Việt và tiếng Anh)`;

      const response = await axios.post(
        API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        response: response.data.choices[0].message.content
      };
    } catch (error) {
      console.error('Error in dictionary lookup:', error);
      throw error.response?.data || error.message;
    }
  },
}; 