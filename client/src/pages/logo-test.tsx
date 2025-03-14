import React from 'react';

export default function LogoTest() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Logo Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
        <h2>Direct Image Test</h2>
        <p>Hardcoded path: <code>/uploads/logo-1741979910954.png</code></p>
        <img 
          src="/uploads/logo-1741979910954.png" 
          alt="Logo Direct Test"
          style={{ maxWidth: '300px', border: '2px solid #eee' }}
          onLoad={() => console.log("Logo loaded successfully!")}
          onError={(e) => console.error("Logo failed to load:", e)}
        />
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
        <h2>Image with Cache-Busting</h2>
        <p>Path with timestamp: <code>/uploads/logo-1741979910954.png?t={Date.now()}</code></p>
        <img 
          src={`/uploads/logo-1741979910954.png?t=${Date.now()}`}
          alt="Logo Cache-Bust Test"
          style={{ maxWidth: '300px', border: '2px solid #eee' }}
          onLoad={() => console.log("Cache-busted logo loaded successfully!")}
          onError={(e) => console.error("Cache-busted logo failed to load:", e)}
        />
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
        <h2>Test with HTML Tag</h2>
        <p>Direct HTML img tag (bypassing React):</p>
        <div dangerouslySetInnerHTML={{
          __html: '<img src="/uploads/logo-1741979910954.png" alt="HTML Tag Test" style="max-width: 300px; border: 2px solid #eee;" />'
        }} />
      </div>
      
      <div>
        <a href="/">Return to home</a>
      </div>
    </div>
  );
}