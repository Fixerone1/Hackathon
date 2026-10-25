'use client';

import { useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

const connectionErrorKey = 'careerforge-google-calendar-error';

export function GooglePrivacyConsentBridge() {
  useEffect(() => {
    let active = true;
    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch {
      return;
    }

    async function recordConsent(session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) {
      if (!session || localStorage.getItem('careerforge-google-privacy-consent') !== 'true') return;
      const { error } = await supabase.auth.updateUser({
        data: { privacy_consent: true, privacy_notice_version: 'prototype-1' },
      });
      if (error) {
        localStorage.setItem(connectionErrorKey, `Privacy consent could not be recorded: ${error.message}`);
        return;
      }
      if (active) {
        localStorage.removeItem('careerforge-google-privacy-consent');
      }
    }

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) throw error;
      if (active) await recordConsent(data.session);
    }).catch((caught: unknown) => {
      if (active) localStorage.setItem(connectionErrorKey, caught instanceof Error ? caught.message : 'Google sign-in could not be completed.');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        if (active) void recordConsent(session).catch((caught: unknown) => {
          if (active) localStorage.setItem(connectionErrorKey, caught instanceof Error ? caught.message : 'Google sign-in could not be completed.');
        });
      }, 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}
