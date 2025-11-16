import config from '../config.js';
import { DexaEvents } from './events.js';
import { DexaStorage } from './storage.js';
import { DexaSession } from './session.js';
import { DexaRoles } from './roles.js';
import { DexaPermissions } from './permissions.js';
import { DexaSupabase } from './supabase.js';
import { DexaRouter } from './router.js';

window.DexaCore = window.DexaCore || {};

DexaCore.events = new DexaEvents();

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('[DexaCore] Uncaught error:', event.error);
    if (window.DexaCoreConfig?.debug && window.DexaToast) {
        DexaToast.error(`Error: ${event.error?.message || 'Unknown error'}`);
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[DexaCore] Unhandled promise rejection:', event.reason);
    if (window.DexaCoreConfig?.debug && window.DexaToast) {
        DexaToast.error('An unexpected error occurred');
    }
});

async function waitForDependencies() {
    const maxWait = 5000;
    const startTime = Date.now();
    
    while (!window.supabase) {
        if (Date.now() - startTime > maxWait) {
            throw new Error("Supabase library failed to load");
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DexaCore] Booting...");

    try {
        await waitForDependencies();
        
        DexaCore.supabase = DexaSupabase;
        DexaCore.session = new DexaSession();
        DexaCore.roles = new DexaRoles();
        DexaCore.permissions = new DexaPermissions();
        DexaCore.router = new DexaRouter();

        if (window.DexaCoreConfig?.supabase?.url && window.DexaCoreConfig?.supabase?.anonKey) {
            DexaSupabase.init();
        } else {
            console.warn("[DexaCore] Supabase config not found. Auth features will be limited.");
        }

        await DexaCore.roles.loadRoles();

        DexaCore.events.emit("core:ready");
        console.log("[DexaCore] Ready");
        
        DexaCore.router.handleRoute();
    } catch (error) {
        console.error("[DexaCore] Boot failed:", error);
        document.querySelector("#app").innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h1>System Error</h1>
                <p>Failed to initialize application: ${error.message}</p>
                <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">
                    Reload Page
                </button>
            </div>
        `;
    }
});

export default {};
