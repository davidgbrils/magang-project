import { SyncOutputPanel } from "../../../../../../features/synchronization/SyncResults";

export default async function SyncOutputPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SyncOutputPanel jobId={id} />;
}
