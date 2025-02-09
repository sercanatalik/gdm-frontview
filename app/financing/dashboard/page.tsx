import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function FinancingMainPage() {
  return (
    <ContentLayout title="Dashboard">

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </div>
    </ContentLayout>
  );
}
