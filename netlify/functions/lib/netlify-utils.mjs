import { BUILD } from "./config.mjs";

export async function triggerDeploy() 
{
    await fetch(BUILD.netlifyHook, { method: "POST" });
}