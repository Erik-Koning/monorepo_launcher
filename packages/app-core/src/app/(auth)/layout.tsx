
import "@/styles/globals.css";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <section className="h-full bg-background-blue">{children}</section>
    </>
  );
}
