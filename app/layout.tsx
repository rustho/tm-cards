import type { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { Root } from "@/components/Root/Root";
import { I18nProvider } from "@/core/i18n/provider";
import { FooterMenu } from "@/components/FooterMenu";
import { APP_METADATA } from "@/config/constants";

import "@telegram-apps/telegram-ui/dist/styles.css";
import "normalize.css/normalize.css";
import "./_assets/globals.css";
import { useAuth } from "@/hooks/useAuth";
import {handjet} from "@/app/fonts";

export const metadata: Metadata = APP_METADATA;

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={handjet.variable}>
      <body>
        <I18nProvider>
          <Root>{children}</Root>
        </I18nProvider>
      </body>
    </html>
  );
}
