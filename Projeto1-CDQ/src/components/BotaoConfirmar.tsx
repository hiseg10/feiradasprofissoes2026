"use client";

type Props = {
  children: React.ReactNode;
  mensagem?: string;
  className?: string;
};

export function BotaoConfirmar({ children, mensagem = "Tem certeza?", className }: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(mensagem)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
