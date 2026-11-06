import {
  STATUS_ANUNCIO_COR,
  STATUS_ANUNCIO_LABEL,
  STATUS_USUARIO_LABEL,
  type StatusAnuncio,
} from "@/lib/constantes";

export function StatusAnuncioBadge({ status }: { status: StatusAnuncio }) {
  return <span className={`badge ${STATUS_ANUNCIO_COR[status] ?? "bg-slate-100 text-slate-600"}`}>{STATUS_ANUNCIO_LABEL[status] ?? status}</span>;
}

const CORES_USUARIO: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  aprovado: "bg-brand-100 text-brand-800",
  bloqueado: "bg-red-100 text-red-700",
};

export function StatusUsuarioBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${CORES_USUARIO[status] ?? "bg-slate-100 text-slate-600"}`}>
      {STATUS_USUARIO_LABEL[status as keyof typeof STATUS_USUARIO_LABEL] ?? status}
    </span>
  );
}
