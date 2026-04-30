import './global.css';

import { TomSessionProvider } from './_providers/tom-session-provider';

export const metadata = {
  title: 'TOM Club Management',
  description:
    'Team TOM club management workspace for students, teachers, and admins.',
  themeColor: '#f4f7fb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-[#f4f7fb]">
        {/*  */}
        <TomSessionProvider>{children}</TomSessionProvider>
        {/*  */}
      </body>
    </html>
  );
}
