import { SyncProgressPanel } from "../../../../../../features/synchronization/Synchronization";

export default async function SyncProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SyncProgressPanel jobId={id} />;
}
