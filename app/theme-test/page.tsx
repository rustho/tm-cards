"use client";

import { useState, useEffect } from "react";

export default function ThemeTestPage() {
  const [inputValue, setInputValue] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleShowSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen p-4" style={{ background: 'var(--theme-bg-primary)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Theme Toggle */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              🎨 Brand-First Theme System
            </h1>
            <button 
              onClick={toggleTheme}
              className="theme-btn-accent text-sm px-3 py-2"
              title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <p className="text-lg" style={{ color: 'var(--theme-text-secondary)' }}>
            Beautiful custom palette overriding all Telegram colors
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" 
               style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-secondary)' }}>
            Current theme: <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
              {isDark ? 'Dark' : 'Light'}
            </span>
          </div>
        </div>

        {/* Brand Color Showcase */}
        <div className="theme-card">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
            Brand Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'var(--brand-primary)' }}></div>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>Primary</p>
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>#5D90C0</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'var(--brand-secondary)' }}></div>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>Secondary</p>
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>#AFC7DA</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'var(--brand-accent)' }}></div>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>Accent</p>
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>#89C3AD</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'var(--brand-bg)' }}></div>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>Background</p>
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>#D4E2EC</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'var(--brand-muted)' }}></div>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>Muted</p>
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>#8DA4B1</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 rounded-lg mb-2 flex items-center justify-center" style={{ background: 'var(--brand-text-on-light)', color: 'white' }}>
                Text
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>Text</p>
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>#1E1E1E</p>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="theme-card">
            <h3 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
              Standard Card
            </h3>
            <p style={{ color: 'var(--theme-text-secondary)' }}>
              This card uses your beautiful brand colors with hover effects.
            </p>
          </div>

          <div 
            className="p-6 rounded-xl transition-all duration-200 hover:transform hover:-translate-y-1"
            style={{ 
              background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))',
              color: 'var(--theme-text-on-color)',
              boxShadow: '0 4px 16px var(--theme-shadow-primary)'
            }}
          >
            <h3 className="font-semibold mb-2">Primary Card</h3>
            <p className="opacity-90">Beautiful gradient using your primary brand colors.</p>
          </div>

          <div 
            className="p-6 rounded-xl transition-all duration-200 hover:transform hover:-translate-y-1"
            style={{ 
              background: 'linear-gradient(135deg, var(--theme-accent), #71B3A1)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(137, 195, 173, 0.3)'
            }}
          >
            <h3 className="font-semibold mb-2">Accent Card</h3>
            <p className="opacity-90">Modern glass morphism with accent colors.</p>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="theme-card">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
            Beautiful Brand Buttons
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="theme-btn-primary">
              Primary Button
            </button>
            <button className="theme-btn-secondary">
              Secondary Button
            </button>
            <button className="theme-btn-accent">
              Accent Button
            </button>
            <button className="theme-btn-primary" onClick={handleShowSuccess}>
              Show Success Toast
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="theme-card">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
            Form Elements
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                Text Input
              </label>
              <input
                type="text"
                className="theme-input"
                placeholder="Beautiful themed input..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                Select Dropdown
              </label>
              <select className="theme-select">
                <option>Brand Option 1</option>
                <option>Brand Option 2</option>
                <option>Brand Option 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="theme-card">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
            Status Indicators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="theme-success">
              ✅ Success
            </div>
            <div className="theme-warning">
              ⚠️ Warning
            </div>
            <div className="theme-error">
              ❌ Error
            </div>
            <div className="theme-info">
              ℹ️ Info
            </div>
          </div>
        </div>

        {/* Brand Gradients */}
        <div className="theme-card">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
            Brand Gradients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="p-6 rounded-xl text-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))',
                color: 'var(--theme-text-on-color)'
              }}
            >
              <h3 className="font-semibold">Primary Gradient</h3>
              <p className="text-sm opacity-90">Beautiful blue gradient</p>
            </div>
            <div 
              className="p-6 rounded-xl text-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--theme-secondary), var(--brand-muted))',
                color: 'var(--theme-text-primary)'
              }}
            >
              <h3 className="font-semibold">Secondary Gradient</h3>
              <p className="text-sm opacity-75">Soft secondary colors</p>
            </div>
            <div 
              className="p-6 rounded-xl text-center text-white"
              style={{ 
                background: 'linear-gradient(135deg, var(--theme-accent), #71B3A1)'
              }}
            >
              <h3 className="font-semibold">Accent Gradient</h3>
              <p className="text-sm opacity-90">Fresh mint gradient</p>
            </div>
          </div>
        </div>

        {/* Theme Override Demonstration */}
        <div className="theme-card">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
            🚀 Theme Override Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium">✅ Telegram Colors</span>
              <span className="text-green-600 text-sm">Completely Overridden</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-800 font-medium">🎨 Brand Colors</span>
              <span className="text-blue-600 text-sm">Active & Beautiful</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-purple-800 font-medium">🌟 Custom Palette</span>
              <span className="text-purple-600 text-sm">Your Design System</span>
            </div>
          </div>
        </div>

        {/* Current Theme Variables Display */}
        <div className="theme-card">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
            Active Theme Variables
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <div className="space-y-1">
                <div>--theme-bg-primary: <span style={{ color: 'var(--theme-bg-primary)' }}>██</span> Your BG</div>
                <div>--theme-surface: <span style={{ color: 'var(--theme-surface)' }}>██</span> Card BG</div>
                <div>--theme-primary: <span style={{ color: 'var(--theme-primary)' }}>██</span> Your Primary</div>
                <div>--theme-secondary: <span style={{ color: 'var(--theme-secondary)' }}>██</span> Your Secondary</div>
                <div>--theme-accent: <span style={{ color: 'var(--theme-accent)' }}>██</span> Your Accent</div>
              </div>
            </div>
            <div>
              <div className="space-y-1">
                <div>--theme-text-primary: <span style={{ color: 'var(--theme-text-primary)' }}>██</span> Main Text</div>
                <div>--theme-text-secondary: <span style={{ color: 'var(--theme-text-secondary)' }}>██</span> Muted Text</div>
                <div>--theme-success: <span style={{ color: 'var(--theme-success)' }}>██</span> Success</div>
                <div>--theme-warning: <span style={{ color: 'var(--theme-warning)' }}>██</span> Warning</div>
                <div>--theme-error: <span style={{ color: 'var(--theme-error)' }}>██</span> Error</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="success-toast">
            <div className="toast-content">
              <div className="toast-icon">🎨</div>
              <div className="toast-message">Brand theme system is beautiful!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 