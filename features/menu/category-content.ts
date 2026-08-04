/**
 * Texto de apresentação de cada seção do cardápio.
 *
 * A tabela `categories` tem `icon` e `color`, mas não descrição — e esta
 * sprint é frontend. Mesmo padrão honesto de `contact-info.ts`: constante
 * aqui, com o mapeamento para o banco registrado no BACKLOG. Categorias sem
 * entrada simplesmente não exibem descrição (nunca um texto genérico
 * fingindo ser específico daquela categoria).
 */
const DESCRIPTIONS_BY_SLUG: Record<string, string> = {
  lanches:
    "Pão macio, carne suculenta e aquele capricho no molho. Feitos na hora, do jeito que você pedir.",
  hamburgueres:
    "Pão macio, carne suculenta e aquele capricho no molho. Feitos na hora, do jeito que você pedir.",
  "hot-dogs":
    "Salsicha, purê, batata palha e o tempero da casa. O clássico que nunca sai de moda.",
  hotdogs:
    "Salsicha, purê, batata palha e o tempero da casa. O clássico que nunca sai de moda.",
  pasteis:
    "Massa fina e crocante, recheio generoso, fritos na hora do seu pedido.",
  porcoes:
    "Para dividir na mesa — ou não. Fritas sequinhas e petiscos que combinam com qualquer conversa.",
  bebidas:
    "Geladas, do refrigerante ao milk-shake, para acompanhar o seu lanche.",
  sobremesas: "O final doce que o seu pedido merece.",
  destaques: "Os pedidos que a casa faz questão de te mostrar primeiro.",
  novidades: "Acabou de entrar no cardápio — venha ser um dos primeiros.",
};

/** Descrição da categoria, ou `null` quando ainda não escrevemos uma. */
export function categoryDescription(slug: string): string | null {
  return DESCRIPTIONS_BY_SLUG[slug] ?? null;
}

/** Slugs com texto pronto — usado nos testes e para auditar cobertura. */
export const DESCRIBED_CATEGORY_SLUGS: string[] =
  Object.keys(DESCRIPTIONS_BY_SLUG);
