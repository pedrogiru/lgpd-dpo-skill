import { useState } from "react";

export function CheckoutForm({ onSubmit }: { onSubmit: (dados: FormData) => void }) {
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setEnviando(true);
        onSubmit(new FormData(e.currentTarget));
      }}
    >
      <input name="nome" placeholder="Nome completo" required />
      <input name="email" type="email" placeholder="voce@example.com" required />
      <input name="cpf" placeholder="000.000.000-00" required />
      <input name="telefone" placeholder="(11) 90000-0000" required />
      {/* campos de endereço omitidos */}

      <label>
        <input type="checkbox" name="aceitaMarketing" defaultChecked />
        Quero receber ofertas e novidades por e-mail e WhatsApp
      </label>

      <p>
        Saiba como tratamos seus dados na <a href="/privacidade">Política de privacidade</a>.
      </p>

      <button type="submit" disabled={enviando}>Finalizar compra</button>
    </form>
  );
}
