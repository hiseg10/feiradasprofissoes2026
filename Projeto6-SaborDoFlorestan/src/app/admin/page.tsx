import type { Metadata } from "next";
import AdminWrapper from "@/components/AdminWrapper";

export const metadata: Metadata = {
  title: "Gestão · Sabor do Florestan",
  description: "Resumo de vendas, produtos, estoque e fechamento da cantina.",
};

export default function AdminPage() {
  return <AdminWrapper />;
}