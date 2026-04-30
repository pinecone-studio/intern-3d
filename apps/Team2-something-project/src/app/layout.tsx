import './global.css';

export const metadata = {
  title: 'Team 2 School Clubs',
  description:
    'A landing page for the Team 2 school club system covering student, teacher, and admin flows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
