import { Outlet } from "@tanstack/react-router";
import { Header } from "../components/Header";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
