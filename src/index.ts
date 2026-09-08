import { clipboard } from "@vendetta/clipboard";
import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";

const patches: (() => void)[] = [];

export default {
    onLoad() {
        try {
            const actionSheet = findByProps("openLazy", "open");

            if (!actionSheet?.openLazy) {
                showToast("Copy Channel Name: ActionSheet не найден");
                return;
            }

            patches.push(
                after("openLazy", actionSheet, (args: any[], result: any) => {
                    try {
                        const props = args?.[0];

                        if (!props) return result;

                        const channel =
                            props.channel ??
                            props.guildChannel ??
                            props;

                        const name = channel?.name;

                        if (!name) return result;

                        const original = result;

                        if (!original || typeof original !== "object") {
                            return result;
                        }

                        return original;
                    } catch {
                        return result;
                    }
                })
            );
        } catch (e) {
            console.log("[Copy Channel Name]", e);
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
