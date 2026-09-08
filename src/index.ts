import { clipboard, logger, metro, patcher } from "@vendetta";

const patches: (() => void)[] = [];

export default {
    onLoad() {
        logger.log("[Copy Channel Name] loaded");

        const modules = metro.findAll(
            (m: any) =>
                m &&
                typeof m === "object" &&
                typeof m.default === "function" &&
                String(m.default).includes("Channel")
        );

        for (const module of modules) {
            try {
                const unpatch = patcher.after(
                    module,
                    "default",
                    (_args: any[], result: any) => result
                );

                patches.push(unpatch);
            } catch {}
        }
    },

    onUnload() {
        for (const unpatch of patches) {
            try {
                unpatch();
            } catch {}
        }

        patches.length = 0;
    },
};
