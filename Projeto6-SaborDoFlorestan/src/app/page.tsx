import Pdv from "@/components/Pdv";
import { listarProdutos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const produtos = await listarProdutos(false);
  return <Pdv produtos={produtos} />;
}
