import React from "react";
import StyledJsxRegistry from "./registry";

export const metadata = {
  title: "Crud com qualidade",
  description: "Você já fez suas tarefas do dia?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
      </body>
    </html>
  );
}
