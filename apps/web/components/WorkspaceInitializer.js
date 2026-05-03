"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";

export default function WorkspaceInitializer() {
  useEffect(() => {
    useWorkspaceStore.getState().init();
  }, []);

  return null;
}
