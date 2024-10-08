import Link from "next/link";

import { ContentLayout } from "@/components/admin-panel/content-layout";

import Stats from "./stats";
export default function DashboardPage() {
  return (
    <ContentLayout title="Dashboard">

    <Stats />
    </ContentLayout>
  );
}
