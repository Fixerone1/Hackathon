'use client';

import { useState } from 'react';
import { OpportunityFeed } from '@/components/OpportunityFeed';
import { PublishedSiteContent } from '@/components/PublishedSiteContent';

type View = 'applications' | 'information';

export function OpportunityHub() {
  const [view, setView] = useState<View>('applications');

  return (
    <section className="mt-6" aria-label="Opportunities">
      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200" role="tablist" aria-label="Opportunity type">
        <button
          id="opportunity-applications-tab"
          type="button"
          role="tab"
          aria-selected={view === 'applications'}
          aria-controls="opportunity-applications-panel"
          className={`min-h-11 border-b-2 px-4 text-sm font-semibold ${view === 'applications' ? 'border-midnight text-midnight' : 'border-transparent text-slate-600 hover:text-midnight'}`}
          onClick={() => setView('applications')}
        >
          Applications
        </button>
        <button
          id="opportunity-information-tab"
          type="button"
          role="tab"
          aria-selected={view === 'information'}
          aria-controls="opportunity-information-panel"
          className={`min-h-11 border-b-2 px-4 text-sm font-semibold ${view === 'information' ? 'border-midnight text-midnight' : 'border-transparent text-slate-600 hover:text-midnight'}`}
          onClick={() => setView('information')}
        >
          Events &amp; useful information
        </button>
      </div>
      <div id="opportunity-applications-panel" role="tabpanel" aria-labelledby="opportunity-applications-tab" hidden={view !== 'applications'}>
        {view === 'applications' && <>
          <p className="mb-5 text-sm leading-6 text-slate-600">Start with the closing date and fit signals. Open a listing to see application preparation options.</p>
          <OpportunityFeed />
        </>}
      </div>
      <div id="opportunity-information-panel" role="tabpanel" aria-labelledby="opportunity-information-tab" hidden={view !== 'information'}>
        {view === 'information' && <>
          <p className="mb-4 text-sm leading-6 text-slate-600">Find upcoming seminars, events, and practical information from our team. Application listings stay in the Applications tab.</p>
          <PublishedSiteContent
            contentType="opportunity_resource"
            heading="Seminars, events & useful information"
            emptyMessage="There are no events or information updates right now. Check back for new content."
          />
        </>}
      </div>
    </section>
  );
}
