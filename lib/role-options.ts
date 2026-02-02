// Opções de papel (Dono, Gerente, Atendente, Agência) usadas na primeira e segunda pergunta sobre pessoas da clínica.

export const ROLE_OPTIONS = [
  { id: "dono", label: "Dono(a) da clínica", icon: "👨‍⚕️" },
  { id: "gerente", label: "Gerente", icon: "👔" },
  { id: "atendente", label: "Atendente", icon: "💬" },
  { id: "agencia", label: "Agência", icon: "📊" },
] as const

export function getRoleByLabel(label: string) {
  return ROLE_OPTIONS.find((r) => r.label === label)
}

export function getRoleById(id: string) {
  return ROLE_OPTIONS.find((r) => r.id === id)
}
