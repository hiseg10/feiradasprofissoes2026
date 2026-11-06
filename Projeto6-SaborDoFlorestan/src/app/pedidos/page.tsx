import type { Metadata } from "next";
import PedidosBoard from "@/components/PedidosBoard";

export const metadata: Metadata = {
  title: "Pedidos · Sabor do Florestan",
  description: "Painel da cozinha e da entrega dos pedidos da cantina.",
};

export default function PedidosPage() {
  return <PedidosBoard />;
}
