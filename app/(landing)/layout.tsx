import Navbar from "@/components/Navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="py-5">
        <Navbar />
      </div>
      <main className="flex-1">{children}</main>
    </>
  );
}
