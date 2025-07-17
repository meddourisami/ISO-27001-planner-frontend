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
  const { tasks, nonconformities, documents, compliance } = state;

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

  // 3. Process documents
  for (const doc of documents.items) {
    const docStatus = doc.status?.toLowerCase();
    let status: StatusLevel | null = null;

    if (docStatus === "approved") {
      status = "implemented";
    } else if (docStatus === "review") {
      status = "planned";
    } else {
      continue; // skip drafts or unknown statuses
    }

    //  Extract clauses like A.8.2, A.8.18 from string
    const clauseIds = typeof doc.relatedControls === "string"
      ? doc.relatedControls
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    //  Match against control.title that starts with a clause
    for (const clause of clauseIds) {
      const matchedControls = compliance.controls.filter(control =>
        control.title?.startsWith(clause)
      );

      for (const ctl of matchedControls) {
        const curr = controlStatusMap[ctl.id];
        if (!curr || statusPriority[status] > statusPriority[curr]) {
          controlStatusMap[ctl.id] = status;
        }
      }
    }
  }

  // 4. Reset outdated controls back to not-implemented
  for (const ctl of compliance.controls) {
    if (!controlStatusMap.hasOwnProperty(ctl.id) && ctl.status !== "not-implemented") {
      await dispatch(
        updateControlStatusAsync({
          id: ctl.id,
          status: "not-implemented",
          evidence: "This control is not implemented right now and needs your review",
        })
      );
    }
  }

  // 5. Apply new statuses
  for (const [id, status] of Object.entries(controlStatusMap)) {
    const control = compliance.controls.find((c) => c.id === id);
    if (control && control.status !== status) {
      await dispatch(
        updateControlStatusAsync({
          id,
          status,
          evidence: "Related modules to this control are implemented",
        })
      );
    }
  }
}