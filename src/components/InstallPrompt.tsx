import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed, don't show prompt
    }

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show again for 7 days
      }
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the install prompt`);

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '90%',
        width: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        padding: '20px',
        zIndex: 9999,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateX(-50%) translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ fontSize: '40px', marginRight: '12px' }}>📱</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            홈 화면에 추가하기
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            Story Maker를 홈 화면에 추가하고<br />
            앱처럼 편리하게 사용하세요!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            color: '#999',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            backgroundColor: '#f5f5f5',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          나중에
        </button>
        <button
          onClick={handleInstall}
          style={{
            flex: 2,
            padding: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          ✓ 추가하기
        </button>
      </div>
    </div>
  );
}
