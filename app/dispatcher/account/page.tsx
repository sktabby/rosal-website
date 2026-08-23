"use client";

import { useQuery } from "@tanstack/react-query";
import AccountView from "@/components/shared/AccountView";
import { getFactoryUnit } from "@/lib/api/factoryUnits";
import { useSession } from "@/providers/SessionProvider";

export default function DispatcherAccountPage() {
  const { user } = useSession();

  const { data: factoryUnit } = useQuery({
    queryKey: ["factory-unit", user?.assignedFactoryUnitId],
    queryFn: () => getFactoryUnit(user!.assignedFactoryUnitId!),
    enabled: !!user?.assignedFactoryUnitId,
  });

  return <AccountView roleIdLabel="Dispatcher" factoryUnitName={factoryUnit?.name} />;
}
