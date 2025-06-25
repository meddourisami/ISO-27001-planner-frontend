import { createListenerMiddleware } from "@reduxjs/toolkit";
import { addTaskAsync, updateTaskAsync } from "../tasks/tasksSlice";
import { syncControlStatuses } from "@utils/syncControlStatuses";
import { addNonConformityAsync, updateNonConformityAsync } from "../nonconformities/nonconformitiesSlice";
import { AppDispatch, RootState } from "@/lib/store";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  predicate: (action) =>
    action.type === updateTaskAsync.fulfilled.type ||
    action.type === addTaskAsync.fulfilled.type ||
    action.type === updateNonConformityAsync.fulfilled.type ||
    action.type === addNonConformityAsync.fulfilled.type,
  
  //TO ADD LATER
    //action.type === deleteNonConformityAsync.fulfilled.type ||
    //action.type === deleteTaskAsync.fulfilled.type,


  effect: async (_, listenerApi) => {
    const dispatch = listenerApi.dispatch as AppDispatch;
    const getState = listenerApi.getState as () => RootState;

    await syncControlStatuses(dispatch, getState);
  },
});