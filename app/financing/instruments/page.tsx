import { ContentLayout } from '@/components/admin-panel/content-layout';
import React from 'react';
import EnhancedTickerSearchWithEdit from '@/app/financing/instruments/components/EnhancedTickerSearchWithEdit';
const FinancingInstrumentsPage: React.FC = () => {
  return (
    <ContentLayout title="Instruments">

    <div>
     <EnhancedTickerSearchWithEdit />
    </div>
   </ContentLayout>
  );
};

export default FinancingInstrumentsPage;
