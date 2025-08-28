import { BUILD } from "./config.mjs";

export const triggerDeploy = async () => 
    await fetch(BUILD.netlifyHook, { method: "POST" });