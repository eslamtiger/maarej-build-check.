import { groupIds } from "@/data/student-v103-view";

export function generateStaticParams() {
  return Object.values(groupIds).map((groupId) => ({ groupId }));
}

import { GroupWorkspaceScreen } from "@/components/student/V103DetailScreens";
export default async function Page({ params }: { params: Promise<{ groupId: string }> }) { const { groupId } = await params; return <GroupWorkspaceScreen groupId={groupId}/>; }
