'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceFallbackProps {
  onVoiceEnabled?: () => void;
}

export function VoiceFallback({ onVoiceEnabled }: VoiceFallbackProps) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if microphone is blocked by permissions policy
    const checkPermissionsPolicy = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        // If we get here, microphone works
        onVoiceEnabled?.();
      } catch (error: any) {
        if (error.name === 'NotAllowedError' && error.message.includes('policy')) {
          setShowFallback(true);
        }
      }
    };

    // Small delay to let page load
    setTimeout(checkPermissionsPolicy, 1000);
  }, [onVoiceEnabled]);

  const openInNewWindow = () => {
    const currentUrl = window.location.href;
    const newWindow = window.open(currentUrl, '_blank', 'width=1200,height=800');
    
    if (newWindow) {
      toast.success('Đã mở trang mới với quyền microphone đầy đủ');
      // Optional: close current window if it's in iframe
      if (window !== window.parent) {
        toast.info('Bạn có thể đóng tab này và sử dụng tab mới');
      }
    } else {
      toast.error('Không thể mở cửa sổ mới. Vui lòng kiểm tra popup blocker.');
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy URL. Mở trong tab mới để sử dụng voice chat!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Đã copy URL. Mở trong tab mới để sử dụng voice chat!');
    }
  };

  if (!showFallback) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <MicOff className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Voice Chat cần HTTPS
          </h2>
          <p className="text-gray-600 mt-2">
            {window.location.protocol === 'http:' 
              ? 'Microphone yêu cầu HTTPS để hoạt động. Vui lòng mở trong cửa sổ mới với HTTPS hoặc sử dụng ngrok.'
              : 'Trang này đang chạy trong context bị hạn chế permissions. Voice chat cần mở trong cửa sổ riêng biệt.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {window.location.protocol === 'http:' ? (
            <>
              <Button
                onClick={() => window.open('https://ngrok.com/download', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Tải ngrok (Recommended)
              </Button>
              
              <Button
                onClick={copyUrl}
                variant="outline"
                className="w-full"
              >
                Copy URL để setup HTTPS
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={openInNewWindow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Mở trong cửa sổ mới
              </Button>
              
              <Button
                onClick={copyUrl}
                variant="outline"
                className="w-full"
              >
                Copy URL và mở thủ công
              </Button>
            </>
          )}

          <Button
            onClick={() => setShowFallback(false)}
            variant="ghost"
            className="w-full text-gray-500"
          >
            Đóng (chỉ dùng text chat)
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          <strong>Lưu ý:</strong> Sau khi mở trong cửa sổ mới, voice chat sẽ hoạt động bình thường. 
          Điều này xảy ra do hạn chế bảo mật của browser.
        </div>
      </div>
    </div>
  );
}