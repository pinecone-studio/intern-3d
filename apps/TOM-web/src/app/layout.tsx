import './global.css';

export const metadata = {
  title: 'Ухаалаг ажлын орчны самбар',
  description:
    'Ажил, бүлэг, эвент, мэдлэгийн сан, шалгалт, санал асуулгыг нэг дор төвлөрүүлсэн дотоод систем.',
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
