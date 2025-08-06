document.addEventListener("DOMContentLoaded", () => {
  const calendario = document.getElementById("calendario-mensal");
  const listaAgendamentos = document.getElementById("lista-agendamentos");
  const tituloDia = document.getElementById("dia-selecionado");

  const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const horariosNormais = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
  const horariosExtendidos = [...horariosNormais, "18:00", "18:30", "19:00", "19:30", "20:00"];

  let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

  function gerarCalendario() {
    calendario.innerHTML = "";
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia);
      const diaSemana = data.getDay();
      const diaTexto = diasSemana[diaSemana];
      if (["terca", "quarta", "quinta", "sexta", "sabado"].includes(diaTexto)) {
        const btn = document.createElement("button");
        const dataStr = data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
        btn.textContent = `${diaTexto}\n${dataStr}`;
        btn.onclick = () => mostrarAgendamentos(diaTexto, dataStr);
        calendario.appendChild(btn);
      }
    }
  }

function mostrarAgendamentos(dia, data) {
  tituloDia.textContent = `Agendamentos de ${dia} - ${data}`;
  listaAgendamentos.innerHTML = "";

  // 🔁 Remover seleção de todos os botões
  document.querySelectorAll("#calendario-mensal button").forEach(btn => {
    btn.classList.remove("selecionado");
  });

  // ✅ Adicionar destaque no botão clicado
  const botoes = document.querySelectorAll("#calendario-mensal button");
  botoes.forEach(btn => {
    if (btn.textContent.includes(data)) {
      btn.classList.add("selecionado");
    }
  });

  // ⬇️ Scroll suave para os agendamentos
  setTimeout(() => {
    listaAgendamentos.scrollIntoView({ behavior: "smooth" });
  }, 100);

  const horarios = (dia === "sexta" || dia === "sabado") ? horariosExtendidos : horariosNormais;

  horarios.forEach(h => {
    const ag = agendamentos.find(a => a.data === data && a.horario === h);
    const li = document.createElement("li");

    if (ag) {
      if (ag.status === "bloqueado") {
        li.innerHTML = `<strong>${h}</strong> - Horário bloqueado 
          <button onclick="desbloquearHorario('${ag.id}', '${dia}', '${data}')" class="botao-desbloquear">Desbloquear</button>`;
      } else {
        li.innerHTML = `<strong>${h}</strong> - ${ag.nome} (${ag.telefone})`;
      }
    } else {
      li.innerHTML = `<strong>${h}</strong> - Disponível 
        <button onclick="bloquearHorario('${dia}', '${data}', '${h}')" class="botao-bloquear">Bloquear</button>`;
    }

    listaAgendamentos.appendChild(li);
  });
}


  window.bloquearHorario = (dia, data, horario) => {
    const novo = {
      id: Date.now(),
      nome: "Bloqueado",
      telefone: "",
      dia,
      data,
      horario,
      status: "bloqueado"
    };
    agendamentos.push(novo);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    mostrarAgendamentos(dia, data);
  };

  window.desbloquearHorario = (id, dia, data) => {
    agendamentos = agendamentos.filter(a => a.id != id);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    mostrarAgendamentos(dia, data);
  };

  function renderizarHistorico() {
    const lista = document.getElementById("lista-historico");
    lista.innerHTML = "";

    const aprovados = agendamentos.filter(a => a.status !== "bloqueado");
    if (aprovados.length === 0) {
      lista.innerHTML = "<li>Nenhum atendimento registrado ainda.</li>";
      return;
    }

    aprovados.forEach(a => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${a.horario}</strong> - ${a.nome} (${a.telefone}) - ${a.data}
        <button class="cancelar-btn" onclick="cancelarAgendamento(${a.id})" title="Cancelar agendamento">❌</button>
      `;
      lista.appendChild(li);
    });
  }

  window.cancelarAgendamento = (id) => {
    const confirmar = confirm("Deseja cancelar este agendamento?");
    if (!confirmar) return;

    agendamentos = agendamentos.filter(a => a.id !== id);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    alert("Agendamento cancelado com sucesso!");
    renderizarHistorico();
    gerarCalendario();
  };

  document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".secao").forEach(s => s.classList.remove("ativa"));

    btn.classList.add("active");
    const secao = document.getElementById(btn.dataset.section);
    secao.classList.add("ativa");

    // Limpa os dados visuais ao mudar de aba
    if (btn.dataset.section === "agenda") {
      tituloDia.textContent = "";
      listaAgendamentos.innerHTML = "";
    }

    if (btn.dataset.section === "historico") {
      renderizarHistorico();
    }
  });
});

  gerarCalendario();
});
