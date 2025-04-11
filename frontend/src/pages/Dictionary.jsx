import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { dictionaryService } from '../services/dictionaryService';

const Dictionary = () => {
  const [word, setWord] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [translateDirection, setTranslateDirection] = useState('en-vi');
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) {
      enqueueSnackbar('Vui lòng nhập từ cần tra cứu', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const response = await dictionaryService.lookupWord(word, context, translateDirection);
      setResult(response.response);
      enqueueSnackbar('Tra cứu từ thành công!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message || 'Có lỗi xảy ra khi tra cứu từ', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Từ Điển Thông Minh</h1>
          <p className="text-lg text-gray-600">Tra cứu từ vựng với đầy đủ thông tin và ngữ cảnh sử dụng</p>
        </div>
        
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Switch */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg p-1 bg-gradient-to-r from-blue-50 to-indigo-50">
                <button
                  type="button"
                  onClick={() => setTranslateDirection('en-vi')}
                  className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    translateDirection === 'en-vi'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>🇬🇧</span>
                    <span>→</span>
                    <span>🇻🇳</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTranslateDirection('vi-en')}
                  className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    translateDirection === 'vi-en'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>🇻🇳</span>
                    <span>→</span>
                    <span>🇬🇧</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="word" className="block text-sm font-medium text-gray-700">
                  {translateDirection === 'en-vi' ? 'Từ tiếng Anh' : 'Từ tiếng Việt'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="word"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                    placeholder={translateDirection === 'en-vi' ? 'Nhập từ tiếng Anh...' : 'Nhập từ tiếng Việt...'}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="context" className="block text-sm font-medium text-gray-700">
                  Ngữ cảnh (tùy chọn)
                </label>
                <input
                  type="text"
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                  placeholder="Nhập ngữ cảnh sử dụng từ..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg shadow-lg text-white text-lg font-medium transition-all duration-200 ${
                loading
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tra cứu...
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Tra cứu</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 animate-fade-in">
            <div className="prose max-w-none">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">{word}</h2>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      enqueueSnackbar('Đã sao chép kết quả!', { variant: 'success' });
                    }}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                    title="Sao chép kết quả"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  {result.split('\n').map((line, index) => {
                    if (line.match(/^\d+\./)) {
                      // Section headers
                      return (
                        <h3 key={index} className="text-xl font-semibold text-primary-600 mt-8 first:mt-0">
                          {line}
                        </h3>
                      );
                    } else if (line.startsWith('-')) {
                      // List items
                      return (
                        <div key={index} className="flex items-start space-x-3 pl-4">
                          <span className="text-primary-500 mt-1">•</span>
                          <span className="text-gray-700">{line.substring(1).trim()}</span>
                        </div>
                      );
                    } else if (line.trim() === '') {
                      // Empty lines
                      return <div key={index} className="h-4" />;
                    } else {
                      // Regular text
                      return (
                        <p key={index} className="text-gray-700 leading-relaxed">
                          {line}
                        </p>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dictionary; 