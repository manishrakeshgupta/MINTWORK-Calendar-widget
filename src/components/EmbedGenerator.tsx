import React, { useState } from 'react';
import { BookingWidget } from './BookingWidget';
import { Code, Copy, Check, ExternalLink, ShieldCheck, Monitor, Smartphone, Layers } from 'lucide-react';

export const EmbedGenerator: React.FC = () => {
  const [borderRadius, setBorderRadius] = useState('16');
  const [maxWidth, setMaxWidth] = useState('720');
  const [minHeight, setMinHeight] = useState('780');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedType, setCopiedType] = useState<'html' | 'react' | 'csp' | null>(null);

  const currentDomain = window.location.origin;

  const htmlSnippet = `<iframe
  src="${currentDomain}/"
  title="Request an appointment"
  width="100%"
  height="${minHeight}"
  loading="lazy"
  style="border:1px solid #e2e8f0;border-radius:${borderRadius}px;max-width:${maxWidth}px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);"
></iframe>`;

  const reactSnippet = `import React from 'react';

export const BookingEmbed = () => {
  return (
    <div style={{ maxWidth: '${maxWidth}px', margin: '0 auto', width: '100%' }}>
      <iframe
        src="${currentDomain}/"
        title="Request an appointment"
        width="100%"
        height="${minHeight}"
        loading="lazy"
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '${borderRadius}px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        }}
      />
    </div>
  );
};`;

  const cspSnippet = `# Add to next.config.ts or your reverse proxy headers
Content-Security-Policy: frame-ancestors 'self' https://yourcompany.com https://*.yourcompany.com;`;

  const handleCopy = (text: string, type: 'html' | 'react' | 'csp') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
              Website Integration
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Embed Widget Generator</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Embed this calendar approval booking system directly into your SaaS marketing site, portfolio, or documentation.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Max Container Width</label>
            <select
              value={maxWidth}
              onChange={e => setMaxWidth(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white"
            >
              <option value="600">600px (Compact)</option>
              <option value="720">720px (Standard / Recommended)</option>
              <option value="840">840px (Wide)</option>
              <option value="100%">100% (Full Fluid Width)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corner Radius</label>
            <select
              value={borderRadius}
              onChange={e => setBorderRadius(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white"
            >
              <option value="0">0px (Sharp)</option>
              <option value="8">8px (Subtle)</option>
              <option value="16">16px (Rounded)</option>
              <option value="24">24px (Soft)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Frame Height</label>
            <select
              value={minHeight}
              onChange={e => setMinHeight(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white"
            >
              <option value="720">720px</option>
              <option value="780">780px (Standard)</option>
              <option value="880">880px (Spacious)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Code Snippets Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HTML Embed Snippet */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                HTML iFrame Snippet
              </span>
              <button
                onClick={() => handleCopy(htmlSnippet, 'html')}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 transition"
              >
                {copiedType === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'html' ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 bg-slate-950/80 p-3.5 rounded-lg overflow-x-auto whitespace-pre">
              {htmlSnippet}
            </pre>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-mono">
            Zero-dependencies · Works on WordPress, Webflow, Squarespace, Ghost, or vanilla HTML.
          </div>
        </div>

        {/* React Component Snippet */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                React / Next.js Component
              </span>
              <button
                onClick={() => handleCopy(reactSnippet, 'react')}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 transition"
              >
                {copiedType === 'react' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'react' ? 'Copied!' : 'Copy Component'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 bg-slate-950/80 p-3.5 rounded-lg overflow-x-auto whitespace-pre">
              {reactSnippet}
            </pre>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-mono">
            Drop directly into Next.js App Router or Vite React apps.
          </div>
        </div>
      </div>

      {/* CSP Security Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              Production Security Note: frame-ancestors CSP
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              To prevent clickjacking while allowing this widget to be safely embedded on your parent domain, configure a restrictive <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">frame-ancestors</code> directive in your server headers.
            </p>
            <div className="mt-2.5 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-800">
              <span className="truncate">{cspSnippet.split('\n')[1]}</span>
              <button
                onClick={() => handleCopy(cspSnippet.split('\n')[1], 'csp')}
                className="text-emerald-700 hover:text-emerald-900 font-sans font-semibold text-xs ml-2 shrink-0"
              >
                {copiedType === 'csp' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Preview Container */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 shadow-inner">
        <div className="text-center mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            Live Host Website Preview ({previewDevice === 'desktop' ? `${maxWidth}px Viewport` : 'Mobile 390px Viewport'})
          </span>
        </div>

        <div
          className="mx-auto transition-all duration-300"
          style={{
            maxWidth: previewDevice === 'mobile' ? '400px' : maxWidth === '100%' ? '100%' : `${maxWidth}px`,
          }}
        >
          <div
            className="overflow-hidden bg-white"
            style={{
              borderRadius: `${borderRadius}px`,
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            }}
          >
            <BookingWidget compactMode={previewDevice === 'mobile'} />
          </div>
        </div>
      </div>
    </div>
  );
};
