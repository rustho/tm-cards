"use client";

import { useMemo } from "react";
import { useSignal, initData, type User } from "@telegram-apps/sdk-react";
import { Section, Cell, Placeholder } from "@telegram-apps/telegram-ui";

import { Page } from "@/components/Page";

export default function InitDataPage() {
  const user = {
    username: "test",
    first_name: "test",
    last_name: "test",
    id: 1,
  };

  return (
    <Page>
      {user ? (
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">Your Match Details</h1>
          <div className="bg-white rounded-lg p-4 shadow">
            <Section
              header="User Information"
              footer="This information is provided by the Telegram API."
            >
              <Cell>
                <strong>Username:</strong> {user.username || "Not provided"}
              </Cell>
              <Cell>
                <strong>First Name:</strong> {user.first_name}
              </Cell>
              {user.last_name && (
                <Cell>
                  <strong>Last Name:</strong> {user.last_name}
                </Cell>
              )}
              <Cell>
                <strong>User ID:</strong> {user.id}
              </Cell>
            </Section>
          </div>
        </div>
      ) : (
        <Placeholder>Loading user data...</Placeholder>
      )}
    </Page>
  );
}
