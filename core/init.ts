import {
  backButton,
  emitEvent,
  init as initSDK,
  initData,
  miniApp,
  mockTelegramEnv,
  retrieveLaunchParams,
  setDebug,
  themeParams,
  type ThemeParams,
  viewport,
} from "@tma.js/sdk-react";

/**
 * Initializes the Telegram Mini Apps SDK and mounts the components the app
 * uses. Called once from components/Root/Root.tsx after mockEnv().
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  setDebug(options.debug);
  initSDK();

  if (options.eruda) {
    void import("eruda").then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    });
  }

  // Telegram for macOS does not answer "web_app_request_theme" and sends a
  // malformed "web_app_request_safe_area" response. Mock both.
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event.name === "web_app_request_theme") {
          let tp: Partial<ThemeParams> = {};
          if (firstThemeSent) {
            tp = themeParams.state as Partial<ThemeParams>;
          } else {
            firstThemeSent = true;
            tp = (retrieveLaunchParams().tgWebAppThemeParams || {}) as Partial<ThemeParams>;
          }
          return emitEvent("theme_changed", { theme_params: tp as any });
        }
        if (event.name === "web_app_request_safe_area") {
          return emitEvent("safe_area_changed", { left: 0, top: 0, right: 0, bottom: 0 });
        }
        next();
      },
    });
  }

  backButton.mount();
  initData.restore();

  try {
    miniApp.mount();
    themeParams.bindCssVars();
  } catch {
    // miniApp not available in this environment
  }

  try {
    await viewport.mount();
    viewport.bindCssVars();
  } catch {
    // viewport not available in this environment (or already bound)
  }
}
