import { useClientOnce } from "@/hooks/useClientOnce";
import {
  isTMA,
  type LaunchParams,
  mockTelegramEnv,
  parseInitData,
  retrieveLaunchParams,
} from "@telegram-apps/sdk-react";

/**
 * Mocks Telegram environment in development mode.
 */
export function useTelegramMock(): void {
  useClientOnce(() => {
    if (!sessionStorage.getItem("env-mocked") && isTMA("simple")) {
      return;
    }

    // Determine which launch params should be applied. We could already
    // apply them previously, or they may be specified on purpose using the
    // default launch parameters transmission method.
    let lp: LaunchParams | undefined;
    try {
      lp = retrieveLaunchParams();
    } catch (e) {
      const initDataRaw = new URLSearchParams([
        [
          "user",
          JSON.stringify({
            id: 135052006,
            first_name: "Andrew",
            last_name: "Rogue",
            username: "rogue",
            language_code: "en",
            is_premium: true,
            allows_write_to_pm: true,
          }),
        ],
        [
          "hash",
          "89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31",
        ],
        ["auth_date", "1716922846"],
        ["start_param", "debug"],
        ["chat_type", "sender"],
        ["chat_instance", "8428209589180549439"],
        ["signature", "mock_signature_for_development"],
      ]).toString();

      let parsedInitData;
      try {
        parsedInitData = parseInitData(initDataRaw);
      } catch (parseError) {
        console.warn("Failed to parse mock initData, using minimal fallback:", parseError);
        // Provide a minimal fallback initData structure
        parsedInitData = {
          user: {
            id: 135052006,
            firstName: "Andrew",
            lastName: "Rogue",
            username: "rogue",
            languageCode: "en",
            isPremium: true,
            allowsWriteToPm: true,
          },
          authDate: new Date(1716922846 * 1000),
          hash: "89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31",
          startParam: "debug",
          chatType: "sender",
          chatInstance: "8428209589180549439",
          signature: "mock_signature_for_development",
        };
      }

      // Choose theme: 'light' or 'dark'
      const mockTheme = (process.env.NODE_ENV === 'development' ? 'dark' : 'light') as 'light' | 'dark';
      
      const lightTheme = {
        accentTextColor: "#007aff" as `#${string}`,
        bgColor: "#ffffff" as `#${string}`,
        buttonColor: "#007aff" as `#${string}`, 
        buttonTextColor: "#ffffff" as `#${string}`,
        destructiveTextColor: "#ff3b30" as `#${string}`,
        headerBgColor: "#f7f7f7" as `#${string}`,
        hintColor: "#999999" as `#${string}`,
        linkColor: "#007aff" as `#${string}`,
        secondaryBgColor: "#f1f1f1" as `#${string}`, 
        sectionBgColor: "#ffffff" as `#${string}`,
        sectionHeaderTextColor: "#007aff" as `#${string}`,
        subtitleTextColor: "#999999" as `#${string}`,
        textColor: "#000000" as `#${string}`,
      };

      const darkTheme = {
        accentTextColor: "#6ab2f2" as `#${string}`,
        bgColor: "#17212b" as `#${string}`,
        buttonColor: "#5288c1" as `#${string}`,
        buttonTextColor: "#ffffff" as `#${string}`, 
        destructiveTextColor: "#ec3942" as `#${string}`,
        headerBgColor: "#17212b" as `#${string}`,
        hintColor: "#708499" as `#${string}`,
        linkColor: "#6ab3f3" as `#${string}`,
        secondaryBgColor: "#232e3c" as `#${string}`,
        sectionBgColor: "#17212b" as `#${string}`, 
        sectionHeaderTextColor: "#6ab3f3" as `#${string}`,
        subtitleTextColor: "#708499" as `#${string}`,
        textColor: "#f5f5f5" as `#${string}`,
      };

      lp = {
        themeParams: (() => {
          if (mockTheme === 'light') {
            return lightTheme;
          } else {
            return darkTheme;
          }
        })(),
        initData: parsedInitData,
        initDataRaw,
        version: "8",
        platform: "tdesktop",
      };
    }

    sessionStorage.setItem("env-mocked", "1");
    if (lp) {
      mockTelegramEnv(lp);
      console.warn(
        "⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram."
      );
    }
  });
}
