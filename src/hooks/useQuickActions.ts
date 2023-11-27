import * as QuickActions from "expo-quick-actions";
import { router } from "expo-router";
import React from "react";

import { logEvent } from "@/lib/Analytics";
import { icons, useDynamicAppIcon } from "@/components/DynamicIconContext";
import { Platform } from "react-native";

export function useQuickActionCallback(
  callback?: (data: QuickActions.Action) => void | Promise<void>
) {
  React.useEffect(() => {
    let isMounted = true;

    if (QuickActions.initial) {
      callback?.(QuickActions.initial);
    }

    const sub = QuickActions.addListener((event) => {
      if (isMounted) {
        callback?.(event);
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [QuickActions.initial, callback]);
}

export function useDynamicQuickActions() {
  const [name] = useDynamicAppIcon();
  React.useEffect(() => {
    const actions: QuickActions.Action[] = [];

    if (Platform.OS === "ios") {
      actions.push({
        id: "icon",
        title: "App Icon",
        subtitle: icons.find((icon) => icon.iconId === name)?.name,
        icon: Platform.select({
          ios: "symbol:apps.iphone",
          android: "shortcut_icon",
        }),
        params: { href: "/settings/icon" },
      });
    }

    QuickActions.setItems([
      ...actions,
      {
        id: "achievements",
        title: "Achievements",
        icon: Platform.select({
          ios: "symbol:trophy",
          android: "shortcut_achievements",
        }),
        params: { href: "/challenges" },
      },
      {
        id: "licenses",
        title: "Licenses",
        // subtitle: "(This app doesn't do much)",
        icon: Platform.select({
          ios: "symbol:checkmark.seal",
          android: "shortcut_licenses",
        }),
        params: { href: "/settings/licenses" },
      },
      {
        id: "feedback",
        title: "Leave Feedback",
        subtitle: "Please provide feedback before deleting the app",
        icon: Platform.select({
          ios: "symbol:envelope",
          android: "shortcut_feedback",
        }),
        params: {
          href:
            "mailto:bacon@expo.dev?subject=" +
            // Set a default subject line that I can filter against
            encodeURIComponent(
              "[Pillar Valley]: I have feedback on Pillar Valley"
            ),
        },
      },
    ]);
  }, [name]);

  // Perform navigation on quick action press
  useRouterQuickActions();
}

function useRouterQuickActions() {
  useQuickActionCallback((action) => {
    logEvent("quick_action", {
      action: action.id,
      title: action.title,
      subtitle: action.subtitle,
      href: action.params?.href,
    });

    // Doing this instead of adding an extra layout to the app
    setTimeout(() => {
      if (typeof action.params?.href === "string") {
        router.push(action.params.href);
      }
    });
  });
}
