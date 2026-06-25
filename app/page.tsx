"use client";

import { useState, useMemo, useEffect } from "react";
import React from "react";
import Tooltip from "@/app/components/Tooltip";

type Opt = { label: string; value: string };
type Config = {
  options: Record<string, Opt[]>;
  tooltips: Record<string, string>;
  campaignIds: Record<string, { otg_id: string; tbz_id: string }>;
};

export default function Home() {
  const [config, setConfig] = useState<Config | null>(null);

  const [baseUrlHandle, setBaseUrlHandle] = useState("");
  const [customHandle, setCustomHandle] = useState("");
  const [utmId, setUtmId] = useState("");
  const [tbzId, setTbzId] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [customCampaign, setCustomCampaign] = useState("");
  const [isOtherCampaign, setIsOtherCampaign] = useState(false);
  const [isOtherHandle, setIsOtherHandle] = useState(false);
  const [isOtherSource, setIsOtherSource] = useState(false);
  const [isManualMedium, setIsManualMedium] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig({ options: {}, tooltips: {}, campaignIds: {} }));
  }, []);

  const tip = (field: string) => config?.tooltips?.[field] || "";
  const handles = config?.options?.handle || [];
  const sources = config?.options?.source || [];
  const mediums = config?.options?.medium || [];
  const campaigns = config?.options?.campaign || [];

  const effectiveCampaign = isOtherCampaign ? customCampaign : utmCampaign;

  const isFormValid = useMemo(() => {
    const hasValidHandle = isOtherHandle
      ? customHandle.trim() !== ""
      : baseUrlHandle.trim() !== "";
    const hasValidCampaign = isOtherCampaign
      ? customCampaign.trim() !== ""
      : utmCampaign.trim() !== "";
    return (
      hasValidHandle &&
      hasValidCampaign &&
      utmId.trim() !== "" &&
      tbzId.trim() !== "" &&
      utmSource.trim() !== "" &&
      utmMedium.trim() !== ""
    );
  }, [
    baseUrlHandle,
    customHandle,
    isOtherHandle,
    customCampaign,
    isOtherCampaign,
    utmId,
    tbzId,
    utmSource,
    utmMedium,
    utmCampaign,
  ]);

  const generateUtmUrl = async () => {
    const campaign = effectiveCampaign.trim();

    // Save-on-create: if the user typed a new campaign, persist it to the
    // shared dropdown (idempotent server-side) and refresh the config.
    if (isOtherCampaign && campaign) {
      try {
        await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: campaign }),
        });
        const fresh = await fetch("/api/config").then((r) => r.json());
        setConfig(fresh);
        setIsOtherCampaign(false);
        setCustomCampaign("");
        setUtmCampaign(campaign);
      } catch {
        // Non-fatal: still generate the URL even if the save failed.
      }
    }

    const baseUrl = `https://www.wildernesscommittee.org/${
      isOtherHandle ? customHandle : baseUrlHandle
    }`;
    const url = new URL(baseUrl);
    if (utmId) url.searchParams.append("utm_id", utmId);
    if (tbzId) url.searchParams.append("tbz_id", tbzId);
    if (utmSource) url.searchParams.append("utm_source", utmSource);
    if (utmMedium) url.searchParams.append("utm_medium", utmMedium);
    if (campaign) url.searchParams.append("utm_campaign", campaign);
    if (utmTerm) url.searchParams.append("utm_term", utmTerm);
    if (utmContent) url.searchParams.append("utm_content", utmContent);
    setGeneratedUrl(url.toString());
  };

  const copyToClipboard = () => {
    if (generatedUrl) navigator.clipboard.writeText(generatedUrl);
  };

  const handleUtmSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSource = e.target.value;
    if (newSource === "Other") {
      setIsOtherSource(true);
      setUtmSource("");
      setUtmId("");
      setTbzId("");
      return;
    }
    setIsOtherSource(false);
    setUtmSource(newSource);

    const auto = config?.campaignIds?.[newSource];
    if (auto) {
      setUtmId(auto.otg_id);
      setTbzId(auto.tbz_id);
    } else {
      setUtmId("");
      setTbzId("");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-2xl flex justify-end gap-4 items-center">
        <a href="/admin" className="text-sm text-indigo-400 hover:underline">
          Admin
        </a>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-white">
          Log out
        </button>
      </div>
      <h1 className="text-4xl font-bold mb-8">
        Wilderness Committee UTM Link Generator
      </h1>
      <div className="w-full max-w-2xl">
        {/* UTM Campaign */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Campaign Name <span className="text-red-500">*</span>
            <Tooltip text={tip("utm_campaign")} />
          </label>
          <select
            value={isOtherCampaign ? "Other" : utmCampaign}
            onChange={(e) => {
              if (e.target.value === "Other") {
                setIsOtherCampaign(true);
                setUtmCampaign("");
              } else {
                setIsOtherCampaign(false);
                setUtmCampaign(e.target.value);
              }
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="" disabled hidden>
              Select a campaign
            </option>
            {campaigns.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            <option value="Other">Create new…</option>
          </select>
          {isOtherCampaign && (
            <input
              type="text"
              value={customCampaign}
              onChange={(e) => setCustomCampaign(e.target.value)}
              placeholder="spotted_owl, say_no_to_fracking"
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black placeholder-gray-500"
            />
          )}
        </div>

        {/* URL Handle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            URL Handle <span className="text-red-500">*</span>
            <Tooltip text={tip("handle")} />
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
            <option value="" disabled hidden>
              Select a handle
            </option>
            {handles.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
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
            <Tooltip text={tip("source")} />
          </label>
          <select
            value={isOtherSource ? "Other" : utmSource}
            onChange={handleUtmSourceChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="" disabled hidden>
              Select a source
            </option>
            {sources.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
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
            <Tooltip text={tip("medium")} />
          </label>
          <select
            value={isManualMedium ? "" : utmMedium}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue === "other") {
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
            {mediums.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
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
            <Tooltip text={tip("otg_id")} />
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
            <Tooltip text={tip("tbz_id")} />
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

        {/* UTM Term (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white-700">
            UTM Term
            <span className="text-gray-500 text-xs ml-1">(optional)</span>
            <Tooltip text={tip("utm_term")} />
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
            <Tooltip text={tip("utm_content")} />
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
            <h2 className="text-lg font-medium mb-2 text-black">Generated URL</h2>
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
