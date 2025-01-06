"use client";

import { useState, useMemo } from "react";

export default function Home() {
  const [baseUrlHandle, setBaseUrlHandle] = useState("DonateWildlife");
  const [customHandle, setCustomHandle] = useState("");
  const [utmId, setUtmId] = useState("");
  const [tbzId, setTbzId] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isOtherHandle, setIsOtherHandle] = useState(false);
  const [isOtherSource, setIsOtherSource] = useState(false);
  const [isManualMedium, setIsManualMedium] = useState(false);

  // The auto-populate IDs for Action Alert
  const otgActionAlertID = "701Am0000009AAGIA2";
  const tbzActionAlertID = "701OL000002fbgqYAA";

  // Derived state for form validation
  const isFormValid = useMemo(() => {
    // Check if URL Handle is valid
    const hasValidHandle = isOtherHandle
      ? customHandle.trim() !== ""
      : baseUrlHandle.trim() !== "";

    // Required: utmId, tbzId, utmSource, utmMedium, utmCampaign
    return (
      hasValidHandle &&
      utmId.trim() !== "" &&
      tbzId.trim() !== "" &&
      utmSource.trim() !== "" &&
      utmMedium.trim() !== "" &&
      utmCampaign.trim() !== ""
    );
  }, [
    baseUrlHandle,
    customHandle,
    isOtherHandle,
    utmId,
    tbzId,
    utmSource,
    utmMedium,
    utmCampaign,
  ]);

  const generateUtmUrl = () => {
    const baseUrl = `https://www.wildernesscommittee.org/${
      isOtherHandle ? customHandle : baseUrlHandle
    }`;
    const url = new URL(baseUrl);

    if (utmId) url.searchParams.append("utm_id", utmId);
    if (tbzId) url.searchParams.append("tbz_id", tbzId);
    if (utmSource) url.searchParams.append("utm_source", utmSource);
    if (utmMedium) url.searchParams.append("utm_medium", utmMedium);
    if (utmCampaign) url.searchParams.append("utm_campaign", utmCampaign);
    if (utmTerm) url.searchParams.append("utm_term", utmTerm);
    if (utmContent) url.searchParams.append("utm_content", utmContent);

    setGeneratedUrl(url.toString());
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
    }
  };

  // Handle UTM Source changes
  const handleUtmSourceChange = (e) => {
    const newSource = e.target.value;

    // If the user selected "Other"
    if (newSource === "Other") {
      setIsOtherSource(true);
      setUtmSource(""); // Clear the displayed source
      // Clear IDs, since we won't auto-populate in this case
      setUtmId("");
      setTbzId("");
      return;
    }

    // Otherwise, a standard source
    setIsOtherSource(false);
    setUtmSource(newSource);

    // Auto-populate if it's "action_alert"
    if (newSource === "action_alert") {
      setUtmId(otgActionAlertID);
      setTbzId(tbzActionAlertID);
    } else {
      // For clarity, clear IDs if changing away from "action_alert"
      setUtmId("");
      setTbzId("");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">
        Wilderness Committee UTM Link Generator
      </h1>
      <div className="w-full max-w-2xl">
        {/* URL Handle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            URL Handle <span className="text-red-500">*</span>
          </label>
          <select
            value={isOtherHandle ? "Other" : baseUrlHandle}
            onChange={(e) => {
              if (e.target.value === "Other") {
                setIsOtherHandle(true);
                setBaseUrlHandle("");
              } else {
                setIsOtherHandle(false);
                setBaseUrlHandle(e.target.value);
              }
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="DonateWildlife">DonateWildlife</option>
            <option value="DonateWilderness">DonateWilderness</option>
            <option value="DonateClimate">DonateClimate</option>
            <option value="EndangeredForests">EndangeredForests</option>
            <option value="Other">Other</option>
          </select>
          {isOtherHandle && (
            <input
              type="text"
              value={customHandle}
              onChange={(e) => setCustomHandle(e.target.value)}
              placeholder="Enter custom Handle"
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            />
          )}
        </div>

        {/* UTM Source */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Source <span className="text-red-500">*</span>
          </label>
          <select
            value={isOtherSource ? "Other" : utmSource}
            onChange={handleUtmSourceChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="" disabled hidden>
              Select a source
            </option>
            <option value="action_alert">Action Alert</option>
            <option value="donor_comms">Donor Comms</option>
            <option value="impact_report">Impact Report</option>
            <option value="end_of_year">End Of Year</option>
            <option value="fracking_ej">Fracking Engagement Journey</option>
            <option value="old_growth_ej">Old Growth Engagement Journey</option>
            <option value="action_welcome_ej">
              Action Welcome Engagement Journey
            </option>
            <option value="donor_welcome_ej">
              Donor Welcome Engagement Journey
            </option>
            <option value="Other">Other</option>
          </select>
          {isOtherSource && (
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="spotted_owl_ej, example_source_ej"
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            />
          )}
        </div>

        {/* UTM Medium */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Medium <span className="text-red-500">*</span>
          </label>
          <select
            value={isManualMedium ? "" : utmMedium}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue === "other socials" || newValue === "other") {
                setIsManualMedium(true);
                setUtmMedium("");
              } else {
                setIsManualMedium(false);
                setUtmMedium(newValue);
              }
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="" disabled hidden>
              Select a medium
            </option>
            <option value="email">Email</option>
            <option value="journey">Journey</option>
            <option value="blog">Blog</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="other socials">Other Socials</option>
            <option value="other">Other</option>
          </select>
          {isManualMedium && (
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="Enter custom medium"
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            />
          )}
        </div>

        {/* OTG Campaign ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            OTG Campaign ID <span className="text-red-500">*</span>
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

        {/* TBZ Campaign ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            TBZ Campaign ID <span className="text-red-500">*</span>
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

        {/* UTM Campaign */}
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

        {/* UTM Term (Optional) */}
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

        {/* UTM Content (Optional) */}
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

        {/* Generate Button */}
        <button
          onClick={generateUtmUrl}
          disabled={!isFormValid}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
            isFormValid
              ? "text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          Generate UTM Link
        </button>

        {/* Generated URL & Copy Button */}
        {generatedUrl && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-medium mb-2 text-black">
              Generated URL
            </h2>
            <p className="break-all text-blue-600">{generatedUrl}</p>
            <div className="flex justify-center items-center">
            <button
              type="button"
              onClick={copyToClipboard}
              className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy
            </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
