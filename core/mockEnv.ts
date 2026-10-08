import { emitEvent, isTMA, mockTelegramEnv } from "@tma.js/sdk-react";
import { ADMIN_TELEGRAM_IDS } from "@/config/constants";

/**
 * Mocks the Telegram environment when the app is opened in a plain browser.
 * Development only: the whole body is tree-shaken out of production builds,
 * so a production build opened outside Telegram will fail by design.
 *
 * The mocked init data is unsigned; lib/auth.ts accepts it only in
 * development.
 */
export async function mockEnv(): Promise<void> {
  if (process.env.NODE_ENV !== "development") return;

  const isTma = await isTMA("complete");
  if (isTma) return;

  const themeParams = {
    accent_text_color: "#5d90c0",
    bg_color: "#d4e2ec",
    button_color: "#5d90c0",
    button_text_color: "#ffffff",
    destructive_text_color: "#ef4444",
    header_bg_color: "#d4e2ec",
    hint_color: "#8da4b1",
    link_color: "#5d90c0",
    secondary_bg_color: "#eaf1f6",
    section_bg_color: "#ffffff",
    section_header_text_color: "#5d90c0",
    subtitle_text_color: "#8da4b1",
    text_color: "#1e1e1e",
  } as const;
  const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

  mockTelegramEnv({
    onEvent(e, next) {
      if (e.name === "web_app_request_theme") {
        return emitEvent("theme_changed", { theme_params: themeParams as any });
      }
      if (e.name === "web_app_request_viewport") {
        return emitEvent("viewport_changed", {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }
      if (e.name === "web_app_request_content_safe_area") {
        return emitEvent("content_safe_area_changed", noInsets);
      }
      if (e.name === "web_app_request_safe_area") {
        return emitEvent("safe_area_changed", noInsets);
      }
      next();
    },
    launchParams: new URLSearchParams([
      ["tgWebAppThemeParams", JSON.stringify(themeParams)],
      [
        "tgWebAppData",
        new URLSearchParams([
          ["auth_date", ((Date.now() / 1000) | 0).toString()],
          ["hash", "mock-hash"],
          ["signature", "mock-signature"],
          [
            "user",
            JSON.stringify({
              id: ADMIN_TELEGRAM_IDS[0],
              first_name: "Dev",
              last_name: "Admin",
              username: "dev_admin",
              language_code: "ru",
            }),
          ],
        ]).toString(),
      ],
      ["tgWebAppVersion", "8.4"],
      ["tgWebAppPlatform", "tdesktop"],
    ]),
  });

  console.info(
    "⚠️ Telegram environment mocked for development. Init data is unsigned and is only accepted by the API in development."
  );
}
