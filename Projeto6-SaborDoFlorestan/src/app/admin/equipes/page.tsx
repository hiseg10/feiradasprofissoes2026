import type { Metadata } from "next";
import EquipesWrapper from "@/components/EquipesWrapper";

export const metadata: Metadata = {
  title: "Equipes · Sabor do Florestan",
  description: "Gestão de equipes e delegação de pedidos.",
};

export default function EquipesPage() {
  return <EquipesWrapper />;
}