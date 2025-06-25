import { updateControlStatusAsync } from "@/lib/features/compliance/complianceSlice";
import { AppDispatch, RootState } from "@/lib/store";

type StatusLevel = "implemented" | "partially_implemented" | "planned";

const statusPriority: Record<StatusLevel, number> = {
  implemented: 3,
  partially_implemented: 2,
  planned: 1,
};

export async function syncControlStatuses(
  dispatch: AppDispatch,
  getState: () => RootState
) {
  const state = getState();
  const { tasks, nonconformities, compliance } = state;

  const controlStatusMap: Record<string, StatusLevel> = {};

  // 1. Process tasks
  for (const task of tasks.items) {
    const ctl = task.relatedControl;
    if (!ctl) continue;
    const status = task.status === "done" ? "implemented" : "planned";
    const curr = controlStatusMap[ctl];
    if (!curr || statusPriority[status] > statusPriority[curr]) {
      controlStatusMap[ctl] = status;
    }
  }

  // 2. Process non‑conformities
  for (const nc of nonconformities.items) {
    for (const ctl of nc.relatedControls) {
      const isVerified = nc.verificationStatus === "verified" || nc.verificationStatus === "rejected";
      const status = isVerified ? "implemented" : "partially_implemented";
      const curr = controlStatusMap[ctl];
      if (!curr || statusPriority[status] > statusPriority[curr]) {
        controlStatusMap[ctl] = status;
      }
    }
  }

  // 3. Reset outdated controls back to not-implemented
  for (const ctl of compliance.controls) {
    if (!controlStatusMap.hasOwnProperty(ctl.id) && ctl.status !== "not-implemented") {
      await dispatch(
        updateControlStatusAsync({
          id: ctl.id,
          status: "not-implemented",
          evidence: "No related tasks or non‑conformities remaining",
        })
      );
    }
  }

  // 4. Apply new statuses
  for (const [id, status] of Object.entries(controlStatusMap)) {
    const control = compliance.controls.find((c) => c.id === id);
    if (control && control.status !== status) {
      await dispatch(
        updateControlStatusAsync({
          id,
          status,
          evidence: "Updated via task/non‑conformity change",
        })
      );
    }
  }
}