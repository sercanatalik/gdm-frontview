import React from 'react';
import EnhancedTickerSearchWithEdit from '@/app/financing/instruments/components/EnhancedTickerSearchWithEdit';
import { ContentLayout } from '@/components/admin-panel/content-layout';
type Props = {
  params: { slug: string }
};

export default function InstrumentsPage({ params }: Props) {
    const instrumentId = params.slug || '';

    return (
      
             <ContentLayout title="Instruments">
            <EnhancedTickerSearchWithEdit instrumentId={instrumentId} />
            </ContentLayout>
    );
}

