import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';

export const useSettings = () => {
  const { data: profile = {} } = useProfile();

  useEffect(() => {
    // Apply dyslexia-friendly font
    if (profile.font_preference === 'dyslexia') {
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }

    // Apply high contrast mode
    if (profile.high_contrast) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [profile.font_preference, profile.high_contrast]);

  return { profile };
};