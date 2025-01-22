"use client";

import { Header, Vaults } from "@/lib/components";

export default function App() {
  return (
    <div className="flex flex-col flex-grow   px-3 py-8 sm:px-5 lg:px-14 lg:py-10 overflow-x-hidden">
      <Vaults />
    </div>
  );
}
