import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "@/app/swagger/react-swagger";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="container">
        <ContentLayout title="API Docs">
      <ReactSwagger spec={spec} />
        </ContentLayout>
    </section>
  );
}