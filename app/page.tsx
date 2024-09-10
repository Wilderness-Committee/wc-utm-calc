"use client";

import { useState } from "react";

export default function Home() {
  const [protocol, setProtocol] = useState("https://");
  const [baseUrl, setBaseUrl] = useState("wildernesscommittee.org/donate"); // Pre-populated with default URL
  const [utmId, setUtmId] = useState("");
  const [tbzId, setTbzId] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  const generateUtmUrl = () => {
    const fullUrl = `${protocol}${baseUrl}`;
    const url = new URL(fullUrl);
    if (utmId) url.searchParams.append("utm_id", utmId);
    if (utmSource) url.searchParams.append("utm_source", utmSource);
    if (utmMedium) url.searchParams.append("utm_medium", utmMedium);
    if (utmCampaign) url.searchParams.append("utm_campaign", utmCampaign);
    if (utmTerm) url.searchParams.append("utm_term", utmTerm);
    if (utmContent) url.searchParams.append("utm_content", utmContent);
    if (tbzId) url.searchParams.append("tbz_id", tbzId);

    setGeneratedUrl(url.toString());
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">
        Wilderness Committee UTM Link Generator
      </h1>
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center">
          <label className="block text-sm font-medium text-white-700 mr-2">
            Protocol
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="block w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="https://">https://</option>
            <option value="http://">http://</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            Base URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="wildernesscommittee.org/donate"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            OTG Campaign ID  <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={utmId}
            onChange={(e) => setUtmId(e.target.value)}
            placeholder="701OL000009lpgEYAQ"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            TBZ Campaign ID  <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={tbzId}
            onChange={(e) => setTbzId(e.target.value)}
            placeholder="701OL00000Fn1WzYAJ"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            required          
/>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Source <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={utmSource}
            onChange={(e) => setUtmSource(e.target.value)}
            placeholder="aa, dc, og_ej"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Medium <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={utmMedium}
            onChange={(e) => setUtmMedium(e.target.value)}
            placeholder="email, social"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={utmCampaign}
            onChange={(e) => setUtmCampaign(e.target.value)}
            placeholder="spotted_owl, say_no_to_fracking"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Term
            <span className="text-gray-500 text-xs ml-1">(optional)</span>
          </label>
          <input
            type="text"
            value={utmTerm}
            onChange={(e) => setUtmTerm(e.target.value)}
            placeholder="fracking, environment"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Content
            <span className="text-gray-500 text-xs ml-1">(optional)</span>
          </label>
          <input
            type="text"
            value={utmContent}
            onChange={(e) => setUtmContent(e.target.value)}
            placeholder="ad_banner, email_link"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
          />
        </div>
        <button
          onClick={generateUtmUrl}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Generate UTM Link
        </button>
        {generatedUrl && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-medium mb-2 text-black">
              Generated URL
            </h2>
            <p className="break-all text-blue-600">{generatedUrl}</p>
          </div>
        )}
      </div>
    </main>
  );
}