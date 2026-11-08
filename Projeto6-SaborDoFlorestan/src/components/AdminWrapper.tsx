"use client";

import RequireOperador from "@/components/RequireOperador";
import AdminPanel from "@/components/AdminPanel";

export default function AdminWrapper() {
  return (
    <RequireOperador modos={["caixa", "operador"]}>
      <AdminPanel />
    </RequireOperador>
  );
}
