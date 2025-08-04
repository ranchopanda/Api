import React, { useState } from 'react';
import { Play, Upload, AlertCircle, CheckCircle, Copy, FileImage } from 'lucide-react';
import { getApiBaseUrl } from '../utils/config';

interface APITesterProps {
  apiKey: string;
}

const APITester: React.FC<APITesterProps> = ({ apiKey }) => {
  const [image, setImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'base64' | 'file'>('base64');
  const [crop, setCrop] = useState('tomato');
  const [location, setLocation] = useState('California, USA');
  const [symptoms, setSymptoms] = useState('yellowing leaves with brown spots');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      if (uploadMethod === 'base64') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImage(result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const testAPI = async () => {
    if (uploadMethod === 'base64' && !image) {
      setError('Please upload an image first');
      return;
    }
    if (uploadMethod === 'file' && !imageFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let response: Response;

      if (uploadMethod === 'base64') {
        // JSON payload with base64 image
        const apiBaseUrl = getApiBaseUrl();
        response = await fetch(`${apiBaseUrl}/analyze-disease`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            image,
            crop,
            location,
            symptoms
          })
        });
      } else {
        // Multipart form data with file upload
        const formData = new FormData();
        formData.append('image', imageFile!);
        formData.append('crop', crop);
        formData.append('location', location);
        formData.append('symptoms', symptoms);

        const apiBaseUrl = getApiBaseUrl();
        response = await fetch(`${apiBaseUrl}/analyze-disease`, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey
          },
          body: formData
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileImage className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Plant Saathi AI Tester</h2>
            <p className="text-sm text-gray-600">Test your plant disease detection API</p>
          </div>
        </div>
        
        {/* API Key Info */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-1">API Key Ready</h3>
              <p className="text-sm text-green-700 mb-2">
                Current API Key: <code className="bg-green-100 px-2 py-1 rounded text-xs break-all">{apiKey}</code>
              </p>
              <p className="text-xs text-green-600">
                ✅ Full API key is visible and ready to use for testing
              </p>
            </div>
          </div>
        </div>
        
        {/* Upload Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="base64"
                checked={uploadMethod === 'base64'}
                onChange={(e) => setUploadMethod(e.target.value as 'base64' | 'file')}
                className="mr-2"
              />
              <span className="text-sm">Base64 JSON (Traditional)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="file"
                checked={uploadMethod === 'file'}
                onChange={(e) => setUploadMethod(e.target.value as 'base64' | 'file')}
                className="mr-2"
              />
              <span className="text-sm">Direct File Upload (New)</span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plant Image
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </label>
            {(image || imageFile) && (
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Image ready ({uploadMethod === 'base64' ? 'Base64' : 'File'})
              </span>
            )}
          </div>
          
          {uploadMethod === 'base64' && image && (
            <div className="mt-4">
              <img
                src={image}
                alt="Uploaded plant"
                className="max-w-xs h-48 object-cover rounded-lg border"
              />
            </div>
          )}
          
          {uploadMethod === 'file' && imageFile && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <FileImage className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{imageFile.name}</span>
                <span className="text-xs text-gray-500">({(imageFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            </div>
          )}
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop Type
            </label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., tomato, wheat, corn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., California, USA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observed Symptoms
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., yellowing leaves, brown spots"
            />
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={testAPI}
          disabled={loading || (uploadMethod === 'base64' && !image) || (uploadMethod === 'file' && !imageFile)}
          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          <span>{loading ? 'Analyzing with Plant Saathi AI...' : 'Test Plant Saathi AI'}</span>
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Plant Saathi AI Analysis</h3>
                {result.branding && (
                  <p className="text-sm text-green-600 font-medium">{result.branding}</p>
                )}
              </div>
              <button
                onClick={copyResult}
                className="flex items-center space-x-1 text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 space-y-6">
              {/* Disease Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-1">Disease Detected</h4>
                  <p className="text-lg font-semibold text-gray-900">{result.disease_name}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-1">AI Confidence</h4>
                  <p className="text-lg font-semibold text-green-600">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-1">Disease Stage</h4>
                  <p className="text-lg font-semibold text-gray-900">{result.disease_stage}</p>
                </div>
              </div>

              {/* Symptoms */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Symptoms Identified</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {result.symptoms?.map((symptom: string, index: number) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>

              {/* Action Plan */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Immediate Action Plan</h4>
                <ul className="list-decimal list-inside text-gray-600 space-y-1">
                  {result.action_plan?.map((action: string, index: number) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              {/* Treatments */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Treatment Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-2">🌱 Organic Treatments</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {result.treatments?.organic?.map((treatment: string, index: number) => (
                        <li key={index}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-blue-700 mb-2">🧪 Chemical Treatments</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {result.treatments?.chemical?.map((treatment: string, index: number) => (
                        <li key={index}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-1">Yield Impact</h4>
                  <p className="text-sm text-gray-600">{result.yield_impact}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-1">Spread Risk</h4>
                  <p className="text-sm text-gray-600">{result.spread_risk}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-1">Recovery Chance</h4>
                  <p className="text-sm text-gray-600">{result.recovery_chance}</p>
                </div>
              </div>

              {/* FAQs */}
              {result.faqs && result.faqs.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Frequently Asked Questions</h4>
                  <div className="space-y-3">
                    {result.faqs.map((faq: any, index: number) => (
                      <div key={index}>
                        <h5 className="text-sm font-medium text-gray-800">{faq.question}</h5>
                        <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <details className="bg-white rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-700">View Raw JSON Response</summary>
                <pre className="mt-3 bg-gray-50 p-4 rounded border text-xs overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITester;