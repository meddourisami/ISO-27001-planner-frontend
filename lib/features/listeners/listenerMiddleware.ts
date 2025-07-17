import { createListenerMiddleware } from "@reduxjs/toolkit";
import { addTaskAsync, updateTaskAsync } from "../tasks/tasksSlice";
import { syncControlStatuses } from "@utils/syncControlStatuses";
import { addNonConformityAsync, updateNonConformityAsync } from "../nonconformities/nonconformitiesSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { addAdminUserAsync, fetchAdminsAsync } from "../admin/adminSlice";
import { approveDocumentAsync, updateDocumentAsync } from "../documents/documentsSlice";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  predicate: (action) =>
    action.type === updateTaskAsync.fulfilled.type ||
    action.type === addTaskAsync.fulfilled.type ||
    action.type === updateNonConformityAsync.fulfilled.type ||
    action.type === addNonConformityAsync.fulfilled.type ||
    action.type === approveDocumentAsync.fulfilled.type ||
    action.type === updateDocumentAsync.fulfilled.type,
  
  //TO ADD LATER
    //action.type === deleteNonConformityAsync.fulfilled.type ||
  //action.type === deleteTaskAsync.fulfilled.type ||
  //action.type === deleteDocumentAsync.fulfilled.type


  effect: async (_, listenerApi) => {
    const dispatch = listenerApi.dispatch as AppDispatch;
    const getState = listenerApi.getState as () => RootState;

    await syncControlStatuses(dispatch, getState);
  },
});

listenerMiddleware.startListening({
  predicate: (action) => action.type === addAdminUserAsync.fulfilled.type,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(fetchAdminsAsync());
  },
});