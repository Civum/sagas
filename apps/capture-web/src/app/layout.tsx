import "./globals.css";

//for metadata
export const metadata = {
  title: "Sagas | Contribute",
  description: "Contribute a transcript to a recording.",
};

//recieves a prop or list of properties named children next.js fill sit with current routes content
// This is the root layout component for the application.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  //Layout recieves a prop named children.
  //Layout recives the page a a prop and wrapts it in shared HTML structure. recieves html data and wraps it
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
