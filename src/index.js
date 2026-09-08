import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const Clipboard = findByProps("setString", "getString");
const ActionSheetRowModule = findByProps("ActionSheetRow");
const ActionSheetRow = ActionSheetRowModule?.ActionSheetRow;

function findChannelSheetModule() {
    const candidates = [
        "ChannelLongPressActionSheet",
        "useChannelLongPressActionSheet",
    ];
    for (const name of candidates) {
        const mod = findByProps(name);
        if (mod) return { mod, key: name };
    }
    return null;
}

const MARKER = "revenge-copy-name-row";
let unpatches = [];

function buildRow(name) {
    return {
        $$typeof: Symbol.for("react.element"),
        type: ActionSheetRow,
        key: MARKER,
        props: {
            label: "📋 Copy Name",
            onPress: () => {
                Clipboard.setString(name);
                showToast(
                    `Copied: ${name}`,
                    getAssetIDByName("toast_copy_link") ?? getAssetIDByName("copy")
                );
            },
        },
    };
}

function extractName(channelLike) {
    if (!channelLike) return null;
    return channelLike.name ?? null;
}

export const onLoad = () => {
    const found = findChannelSheetModule();
    if (!found) return;

    const { mod, key } = found;

    const unpatch = after(key, mod, (args, res) => {
        try {
            if (!res) return res;

            const arg0 = args?.[0];
            const channel = arg0?.channel ?? arg0?.props?.channel ?? arg0;
            const name = extractName(channel);
            if (!name) return res;

            const rowsContainer = findInReactTree(
                res,
                (n) => Array.isArray(n?.props?.children) &&
                    n.props.children.some((c) => c?.type === ActionSheetRow)
            );

            if (!rowsContainer) return res;

            const children = rowsContainer.props.children;
            const alreadyAdded = children.some((c) => c?.key === MARKER);
            if (alreadyAdded) return res;

            children.push(buildRow(name));
        } catch (e) {
            console.log("[CopyName]", e);
        }
        return res;
    });

    unpatches.push(unpatch);
};

export const onUnload = () => {
    for (const unpatch of unpatches) {
        try {
            unpatch();
        } catch {}
    }
    unpatches = [];
};
