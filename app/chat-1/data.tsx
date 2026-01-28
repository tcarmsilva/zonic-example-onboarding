import type { ChatbotConfig } from "@/lib/chatbot-config"

// ============================================
// CONFIGURAÇÃO DO CHATBOT DE ONBOARDING
// ============================================

export const chatConfig: ChatbotConfig = {
  welcomeMessages: [
    {
      content: (
        <span>
          Olá! Bem-vindo ao <strong style={{ color: "#0051fe" }}>onboarding da Zonic</strong>! 🎉
        </span>
      ),
      showAvatar: true,
    },
    {
      content: (
        <span>
          Vamos configurar a sua clínica para que você possa aproveitar ao máximo a nossa plataforma.
        </span>
      ),
      showAvatar: false,
    },
    {
      content: (
        <span>
          São algumas perguntas rápidas para personalizar a sua experiência. Vamos começar?
        </span>
      ),
      showAvatar: false,
    },
  ],

  steps: [
    // ============================================
    // SEÇÃO 0: RESPONSÁVEL PELO PROJETO
    // ============================================
    {
      id: "project_responsible_role",
      type: "choices",
      botMessage: "Primeiro, quem é o responsável por este projeto de implantação da Zonic?",
      options: [
        "Dono(a) da clínica",
        "Gerente",
        "Atendente",
        "Agência",
      ],
      dataKey: "project_responsible_role",
      trackingEvent: "project_responsible_role",
    },
    {
      id: "project_responsible_name",
      type: "text",
      botMessage: "Qual é o seu nome completo?",
      placeholder: "Nome completo",
      dataKey: "project_responsible_name",
      trackingEvent: "project_responsible_name",
    },
    {
      id: "project_responsible_phone",
      type: "phone",
      botMessage: "Qual é o seu telefone de contato?",
      dataKey: "project_responsible_phone",
      trackingEvent: "project_responsible_phone",
    },
    {
      id: "owner_name",
      type: "text",
      botMessage: "Qual é o nome do(a) dono(a) da clínica?",
      placeholder: "Nome completo do(a) proprietário(a)",
      dataKey: "owner_name",
      trackingEvent: "owner_name",
      showIf: (userData) => userData.project_responsible_role !== "Dono(a) da clínica",
    },
    {
      id: "owner_phone",
      type: "phone",
      botMessage: "Qual é o telefone do(a) dono(a) da clínica?",
      dataKey: "owner_phone",
      trackingEvent: "owner_phone",
      showIf: (userData) => userData.project_responsible_role !== "Dono(a) da clínica",
    },
    {
      id: "platform_users",
      type: "team_members",
      botMessage: (
        <div className="space-y-2">
          <p>Quem vai usar a plataforma da Zonic no dia a dia?</p>
          <p className="text-sm text-[#04152b]/70">Selecione todas as pessoas que vão acessar o sistema e preencha os dados de cada uma.</p>
        </div>
      ),
      dataKey: "platform_users",
      trackingEvent: "platform_users",
    },

    // ============================================
    // SEÇÃO 1: INFORMAÇÕES BÁSICAS DA CLÍNICA
    // ============================================
    {
      id: "clinic_name",
      type: "text",
      botMessage: "Agora vamos às informações da clínica! Qual é o nome da sua clínica?",
      placeholder: "Ex: Clínica Estética Bella",
      dataKey: "clinic_name",
      trackingEvent: "clinic_name",
    },
    {
      id: "clinic_type",
      type: "choices",
      botMessage: "Qual é o tipo da sua clínica?",
      options: ["Estética", "Médica", "Odonto", "Outro"],
      dataKey: "clinic_type",
      trackingEvent: "clinic_type",
    },
    {
      id: "clinic_type_other",
      type: "text",
      botMessage: "Qual é o tipo da sua clínica?",
      placeholder: "Digite o tipo da sua clínica",
      dataKey: "clinic_type_other",
      trackingEvent: "clinic_type_other",
      showIf: (userData) => userData.clinic_type === "Outro",
    },
    {
      id: "clinic_whatsapp_phone",
      type: "phone",
      botMessage: "Qual é o WhatsApp da sua clínica? Este será o número que a IA vai usar para atender os leads.",
      dataKey: "clinic_whatsapp_phone",
      trackingEvent: "clinic_whatsapp_phone",
    },
    {
      id: "clinic_notification_phone",
      type: "phone",
      botMessage: "Em qual número você deseja receber notificações sobre agendamentos e alertas importantes?",
      dataKey: "clinic_notification_phone",
      trackingEvent: "clinic_notification_phone",
    },
    {
      id: "clinic_timezone",
      type: "timezone",
      botMessage: "Em qual timezone a sua clínica trabalha?",
      dataKey: "clinic_timezone",
      trackingEvent: "clinic_timezone",
    },
    {
      id: "clinic_address",
      type: "text",
      botMessage: "Qual é o endereço completo da sua clínica?",
      placeholder: "Rua, número, bairro, cidade - Estado",
      dataKey: "clinic_address",
      trackingEvent: "clinic_address",
    },
    {
      id: "clinic_google_maps_link",
      type: "text",
      botMessage: "Você tem o link do Google Maps da sua clínica? Cole aqui. Se não tiver, pode digitar 'não tenho'.",
      placeholder: "https://maps.google.com/...",
      dataKey: "clinic_google_maps_link",
      trackingEvent: "clinic_google_maps_link",
    },
    {
      id: "instagram_links",
      type: "multi_text",
      botMessage: "Quais são os perfis de Instagram da sua clínica? Você pode adicionar mais de um se tiver.",
      placeholder: "@suaclinica",
      addButtonText: "Adicionar outro Instagram",
      maxItems: 5,
      dataKey: "instagram_links",
      trackingEvent: "instagram_links",
    },
    {
      id: "operating_hours",
      type: "operating_hours",
      botMessage: "Quais são os horários de funcionamento da sua clínica? Selecione os dias e horários abaixo.",
      dataKey: "operating_hours",
      trackingEvent: "operating_hours",
    },
    {
      id: "parking",
      type: "choices",
      botMessage: "A sua clínica tem estacionamento para os pacientes?",
      options: [
        "Sim, gratuito",
        "Sim, pago",
        "Sim, conveniado",
        "Não tem estacionamento",
        "Estacionamento na rua",
      ],
      dataKey: "parking",
      trackingEvent: "parking",
    },

    // ============================================
    // SEÇÃO 2: CONFIGURAÇÃO DA IA
    // ============================================
    {
      id: "assistant_name",
      type: "text",
      botMessage: (
        <div className="space-y-2">
          <p>Agora vamos configurar a sua assistente de IA! 🤖</p>
          <p>Qual nome você gostaria que ela tivesse? Por exemplo: Clara, Ana, Sofia...</p>
        </div>
      ),
      placeholder: "Nome da assistente",
      dataKey: "assistant_name",
      trackingEvent: "assistant_name",
    },
    {
      id: "greeting",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Qual mensagem de saudação inicial você quer que a IA envie?</p>
          <p className="text-sm text-[#04152b]/70">Exemplo: "Bem-vindo(a) à Clínica X! Somos especialistas em harmonização facial e a melhor clínica da região. Como posso ajudá-lo(a)?"</p>
        </div>
      ),
      placeholder: "Digite a mensagem de saudação...",
      helpText: "Esta será a primeira mensagem que o lead receberá",
      dataKey: "greeting",
      trackingEvent: "greeting",
    },
    {
      id: "bot_reply_to",
      type: "choices",
      botMessage: "A IA deve responder mensagens de todos os leads ou apenas dos que vierem do tráfego pago (anúncios)?",
      options: [
        "Todos os leads",
        "Apenas leads de tráfego pago",
      ],
      dataKey: "bot_reply_to",
      trackingEvent: "bot_reply_to",
    },
    {
      id: "is_group_bot_activated",
      type: "choices",
      botMessage: (
        <div className="space-y-2">
          <p>A IA deve responder mensagens em grupos de WhatsApp?</p>
          <p className="text-sm text-[#04152b]/70">(Ao selecionar sim, na nossa plataforma você pode depois configurar em quais grupos específicos a IA ficará ativa)</p>
        </div>
      ),
      options: ["Sim", "Não"],
      dataKey: "is_group_bot_activated",
      trackingEvent: "is_group_bot_activated",
    },
    {
      id: "is_voice_reply_activated",
      type: "choices",
      botMessage: "Se o lead enviar uma mensagem de voz, você quer que a IA responda também com mensagem de voz gerada por IA?",
      options: ["Sim, responder com voz", "Não, responder com texto"],
      dataKey: "is_voice_reply_activated",
      trackingEvent: "is_voice_reply_activated",
    },
    {
      id: "conversation_flow",
      type: "conversation_flow",
      botMessage: (
        <div className="space-y-2">
          <p>Qual forma de conversa você prefere para a sua IA?</p>
          <p className="text-sm text-[#04152b]/70">Escolha o fluxo que melhor se adapta ao seu atendimento:</p>
        </div>
      ),
      dataKey: "conversation_flow",
      trackingEvent: "conversation_flow",
    },
    {
      id: "conversation_style",
      type: "conversation_style",
      botMessage: (
        <div className="space-y-2">
          <p>Qual tipo de comunicação você quer que a sua IA tenha?</p>
          <p className="text-sm text-[#04152b]/70">Veja os exemplos de cada estilo para entender melhor:</p>
        </div>
      ),
      dataKey: "conversation_style",
      trackingEvent: "conversation_style",
    },

    // ============================================
    // SEÇÃO 3: CALENDÁRIO E AGENDAMENTOS
    // ============================================
    {
      id: "crm_provider",
      type: "choices",
      botMessage: (
        <div className="space-y-2">
          <p>Agora vamos falar sobre agendamentos! 📅</p>
          <p>Qual calendário/sistema você quer usar para gerenciar as agendas?</p>
        </div>
      ),
      options: [
        "Calendário da Zonic",
        "Infosoft",
        "Clinicorp",
        "Belle",
        "Cal.com",
        "Trinks",
        "Clínica Ágil",
        "Prontuário Verde",
        "Clinic Web",
        "Sistema Amigo",
        "iClinic",
        "Outro sistema",
      ],
      dataKey: "crm_provider",
      trackingEvent: "crm_provider",
    },
    {
      id: "crm_provider_other",
      type: "text",
      botMessage: "Qual é o nome do seu sistema de agendamento?",
      placeholder: "Nome do sistema",
      dataKey: "crm_provider_other",
      trackingEvent: "crm_provider_other",
      showIf: (userData) => userData.crm_provider === "Outro sistema",
    },
    {
      id: "familiar_to_crm",
      type: "choices",
      botMessage: "Você e sua equipe sabem o que é um CRM e como usá-lo?",
      options: [
        "Sim, já usamos CRM",
        "Não sabemos o que é",
        "Sabemos, mas precisamos de treinamento",
      ],
      dataKey: "familiar_to_crm",
      trackingEvent: "familiar_to_crm",
    },
    {
      id: "is_ai_allow_to_book_appointments",
      type: "choices",
      botMessage: "A IA pode agendar consultas automaticamente, ou você prefere que ela apenas coloque os pedidos de agendamento para revisão humana?",
      options: [
        "Pode agendar automaticamente",
        "Apenas colocar para revisão",
      ],
      dataKey: "is_ai_allow_to_book_appointments",
      trackingEvent: "is_ai_allow_to_book_appointments",
    },
    {
      id: "capture_info",
      type: "capture_info",
      botMessage: (
        <div className="space-y-2">
          <p>Quais informações você quer que a IA pergunte aos leads <strong>ANTES</strong> de agendar?</p>
          <p className="text-sm text-[#04152b]/70">Por exemplo: idade, plano de saúde, CPF, etc. Para cada pergunta, você pode definir quais respostas são aceitas (se houver restrição).</p>
        </div>
      ),
      dataKey: "capture_info",
      trackingEvent: "capture_info",
    },
    {
      id: "is_booking_reminders_activated",
      type: "choices",
      botMessage: "Você quer que a Zonic envie lembretes automáticos de consulta para os pacientes?",
      options: ["Sim", "Não"],
      dataKey: "is_booking_reminders_activated",
      trackingEvent: "is_booking_reminders_activated",
    },
    {
      id: "booking_reminder_today",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Nós enviamos lembretes 1 dia antes e no dia da consulta.</p>
          <p>Qual mensagem você quer que seja enviada <strong>no dia da consulta</strong>?</p>
        </div>
      ),
      placeholder: "Ex: Olá! Lembrando que sua consulta é hoje às {horario}. Te esperamos!",
      helpText: "Use {nome}, {data}, {horario} para personalizar",
      dataKey: "booking_reminder_today",
      trackingEvent: "booking_reminder_today",
      showIf: (userData) => userData.is_booking_reminders_activated === "Sim",
    },
    {
      id: "booking_reminder_tomorrow",
      type: "textarea",
      botMessage: "E qual mensagem você quer que seja enviada 1 dia antes da consulta?",
      placeholder: "Ex: Olá {nome}! Amanhã você tem consulta às {horario}. Confirma presença?",
      helpText: "Use {nome}, {data}, {horario} para personalizar",
      dataKey: "booking_reminder_tomorrow",
      trackingEvent: "booking_reminder_tomorrow",
      showIf: (userData) => userData.is_booking_reminders_activated === "Sim",
    },

    // ============================================
    // SEÇÃO 4: COMPORTAMENTO DA IA
    // ============================================
    {
      id: "deactivate_on_human_reply",
      type: "choices",
      botMessage: (
        <div className="space-y-2">
          <p>Agora vamos configurar o comportamento da IA! 🧠</p>
          <p>Caso um humano responda uma mensagem no WhatsApp, a IA deve se desligar automaticamente para evitar conflitos?</p>
        </div>
      ),
      options: ["Sim, desligar automaticamente", "Não, manter ativa"],
      dataKey: "deactivate_on_human_reply",
      trackingEvent: "deactivate_on_human_reply",
    },
    {
      id: "ai_reactivation_interval",
      type: "choices",
      botMessage: "Após a IA se auto-desligar (quando um humano responder), em quanto tempo ela deve ser religada automaticamente?",
      options: [
        "1 hora",
        "2 horas",
        "4 horas",
        "8 horas",
        "12 horas",
        "24 horas",
        "Nunca religar automaticamente",
      ],
      dataKey: "ai_reactivation_interval",
      trackingEvent: "ai_reactivation_interval",
      showIf: (userData) => userData.deactivate_on_human_reply === "Sim, desligar automaticamente",
    },
    {
      id: "deactivation_schedule",
      type: "deactivation_schedule",
      botMessage: "A IA deve ficar ligada o tempo todo, ou você quer que ela fique desligada em horários específicos (por exemplo, durante o horário comercial quando sua equipe está atendendo)?",
      dataKey: "deactivation_schedule",
      trackingEvent: "deactivation_schedule",
    },
    {
      id: "is_smart_followups_activated",
      type: "choices",
      botMessage: "Você quer que a IA faça follow-ups inteligentes? Ela pode enviar mensagens de acompanhamento para leads que não responderam.",
      options: ["Sim, ativar follow-ups", "Não"],
      dataKey: "is_smart_followups_activated",
      trackingEvent: "is_smart_followups_activated",
    },
    {
      id: "reactivation_lead_status_ids",
      type: "multi_select",
      botMessage: "Em quais etapas do funil de vendas a IA deve ser reativada automaticamente? Selecione todas que se aplicam.",
      options: [
        "Novo Lead",
        "Em Contato",
        "Interessado",
        "Quer Agendar",
        "Não Compareceu",
        "Agendado",
        "Disposto a Comprar",
        "Comprou",
      ],
      minSelect: 1,
      dataKey: "reactivation_lead_status_ids",
      trackingEvent: "reactivation_lead_status_ids",
    },
    {
      id: "lead_status_ai_activated",
      type: "multi_select",
      botMessage: (
        <div className="space-y-2">
          <p>Em quais etapas do funil de vendas você quer que a IA <strong>pare automaticamente</strong> de responder leads?</p>
          <p className="text-sm text-[#04152b]/70">Por exemplo, ao agendar ou ao comprar, a IA pode parar de responder para que as atendentes assumam o atendimento.</p>
        </div>
      ),
      options: [
        "Novo Lead",
        "Em Contato",
        "Interessado",
        "Quer Agendar",
        "Não Compareceu",
        "Agendado",
        "Disposto a Comprar",
        "Comprou",
      ],
      minSelect: 1,
      dataKey: "lead_status_ai_activated",
      trackingEvent: "lead_status_ai_activated",
    },

    // ============================================
    // SEÇÃO 5: INFORMAÇÕES DO NEGÓCIO
    // ============================================
    {
      id: "how_many_doctors",
      type: "number",
      botMessage: (
        <div className="space-y-2">
          <p>Agora algumas perguntas sobre a estrutura da sua clínica! 🏥</p>
          <p>Quantos doutores/profissionais atendem na sua clínica?</p>
        </div>
      ),
      placeholder: "Quantidade",
      minValue: 1,
      maxValue: 500,
      dataKey: "how_many_doctors",
      trackingEvent: "how_many_doctors",
    },
    {
      id: "how_many_products",
      type: "number",
      botMessage: "Quantos tipos de consultas, procedimentos ou tratamentos a IA vai poder responder dúvidas, enviar preços ou agendar?",
      placeholder: "Quantidade",
      minValue: 1,
      maxValue: 200,
      dataKey: "how_many_products",
      trackingEvent: "how_many_products",
    },
    {
      id: "main_pain_points",
      type: "multi_text",
      botMessage: (
        <div className="space-y-2">
          <p>Quais são as principais dores/problemas que seus pacientes têm?</p>
          <p className="text-sm text-[#04152b]/70">Liste até 10 dores que a IA deve saber identificar nas conversas.</p>
        </div>
      ),
      placeholder: "Ex: Acne, rugas, flacidez...",
      addButtonText: "Adicionar outra dor",
      maxItems: 10,
      dataKey: "main_pain_points",
      trackingEvent: "main_pain_points",
    },

    // ============================================
    // SEÇÃO 6: QUALIFICAÇÃO DE LEADS
    // ============================================
    {
      id: "hot_lead",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Vamos configurar a qualificação de leads! 🔥</p>
          <p>O que você considera como um lead <strong>muito quente</strong>, <strong>quente</strong> e <strong>morno</strong>? Descreva a lógica para cada classificação.</p>
        </div>
      ),
      placeholder: "Ex: Muito quente = quer agendar hoje. Quente = perguntou preço. Morno = só tirou dúvidas...",
      helpText: "Descreva os critérios de qualificação",
      dataKey: "hot_lead",
      trackingEvent: "hot_lead",
    },
    {
      id: "needs_review",
      type: "textarea",
      botMessage: "Em que casos você quer que a IA se desligue automaticamente e coloque a conversa para revisão humana?",
      placeholder: "Ex: Quando o paciente reclama, quando pede reembolso, quando menciona processo...",
      helpText: "Descreva as situações que precisam de atenção humana",
      dataKey: "needs_review",
      trackingEvent: "needs_review",
    },

    // ============================================
    // SEÇÃO 7: NOTIFICAÇÕES E TAREFAS
    // ============================================
    {
      id: "notification",
      type: "multi_select",
      botMessage: (
        <div className="space-y-2">
          <p>Configurando notificações! 🔔</p>
          <p>Em quais casos você quer receber notificações no número de notificações? Pode escolher mais de uma opção.</p>
        </div>
      ),
      options: [
        "Agendamento realizado",
        "Conversa precisa de revisão",
        "Novo lead",
      ],
      minSelect: 1,
      dataKey: "notification",
      trackingEvent: "notification",
    },
    {
      id: "tasks",
      type: "textarea",
      botMessage: "Em quais casos você quer que a IA gere tarefas para as atendentes realizarem?",
      placeholder: "Ex: Ligar para confirmar consulta, enviar orçamento por email...",
      helpText: "Descreva as situações que devem gerar tarefas",
      dataKey: "tasks",
      trackingEvent: "tasks",
    },

    // ============================================
    // SEÇÃO 8: INTEGRAÇÕES E IMPORTAÇÕES
    // ============================================
    {
      id: "import_contacts",
      type: "choices",
      botMessage: (
        <div className="space-y-2">
          <p>Últimas configurações! 🚀</p>
          <p>Você quer importar uma lista de contatos de algum outro sistema para a Zonic?</p>
          <p className="text-sm text-[#04152b]/70">(Se sim, nossa equipe entrará em contato depois para fazer a importação)</p>
        </div>
      ),
      options: ["Sim", "Não"],
      dataKey: "import_contacts",
      trackingEvent: "import_contacts",
    },
    {
      id: "import_ai_off_contacts",
      type: "choices",
      botMessage: "Você quer importar uma lista de contatos para os quais a IA NÃO deve responder? (Ou seja, já deixar esses contatos com a IA desligada)",
      options: ["Sim", "Não"],
      dataKey: "import_ai_off_contacts",
      trackingEvent: "import_ai_off_contacts",
    },
    {
      id: "ads",
      type: "multi_select",
      botMessage: "Você quer integrar dados de anúncios na Zonic? Selecione todas as plataformas que você usa.",
      options: [
        "Não quero integrar",
        "Meta (Facebook/Instagram)",
        "Google Ads",
        "TikTok Ads",
      ],
      minSelect: 1,
      dataKey: "ads",
      trackingEvent: "ads",
    },
    {
      id: "metricas",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Para finalizar! 📊</p>
          <p>Você sabe quais métricas gostaria de ver sobre sua IA, atendimentos, leads, comercial ou qualquer outro indicador?</p>
          <p className="text-sm text-[#04152b]/70">Esta pergunta é para entendermos como podemos melhorar nosso dashboard ou eventualmente criar um personalizado para você.</p>
        </div>
      ),
      placeholder: "Ex: Taxa de conversão, tempo médio de resposta, leads por origem...",
      helpText: "Descreva as métricas que seriam úteis para você",
      dataKey: "metricas",
      trackingEvent: "metricas",
    },
  ],

  // Configuração do calendário para agendamento final
  calendar: {
    preScheduleMessage: (
      <div className="space-y-2">
        <p className="font-semibold text-[#0051fe]">Excelente! Você completou o onboarding! 🎉</p>
        <p>Agora, agende uma reunião com nossa equipe para finalizarmos a configuração da sua clínica.</p>
        <p>Escolha o melhor horário para você:</p>
      </div>
    ),
    calendarId: "1",
    completionMessage: {
      title: "Reunião agendada com sucesso!",
      message: (
        <div className="space-y-2">
          <p>Obrigado por completar o onboarding!</p>
          <p>Nossa equipe entrará em contato no horário agendado para finalizar a configuração.</p>
          <p>Enviaremos um lembrete por WhatsApp antes da reunião.</p>
        </div>
      ),
    },
  },

  completionMessage: {
    title: "Onboarding concluído! 🎉",
    message: (
      <div className="space-y-3">
        <p>Obrigado por completar o onboarding!</p>
        <p>Nossa equipe vai analisar suas respostas e configurar tudo para você.</p>
        <p>Em breve entraremos em contato para os próximos passos.</p>
      </div>
    ),
  },

  tracking: {
    contentName: "Onboarding Clínicas",
    completionName: "Onboarding Completo",
    scheduleName: "Agendamento Onboarding",
  },
}
