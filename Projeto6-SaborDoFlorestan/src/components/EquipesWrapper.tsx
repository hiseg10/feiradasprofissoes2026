"use client";

import RequireOperador from "@/components/RequireOperador";
import EquipesPanel from "@/components/EquipesPanel";

export default function EquipesWrapper() {
  return (
    <RequireOperador modos={["caixa"]}>
      <EquipesPanel />
    </RequireOperador>
  );
}
