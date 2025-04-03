import { parse } from "cookie";

// Função para atualizar a pesquisa
async function updateResearch(token, researchId, researchData) {
  const response = await fetch(
    `${process.env.SERVER_URL}/research/${researchId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(researchData),
    }
  );
  return response;
}

// Função para adicionar um colaborador
async function addCollaborator(token, researchId, userId) {
  const response = await fetch(
    `${process.env.SERVER_URL}/research/${researchId}/contributors/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        instruction: "Pesquisador",
      }),
    }
  );
  return response;
}

// Função para remover um colaborador
async function removeCollaborator(token, researchId, userId) {
  const response = await fetch(
    `${process.env.SERVER_URL}/research/${researchId}/contributors/${userId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
}

// Função que processa os arrays de colaboradores a adicionar e remover
async function processCollaborators(
  token,
  researchId,
  collaboratorsToAdd = [],
  collaboratorsToRemove = []
) {
  // Processa adição dos colaboradores
  const addPromises = collaboratorsToAdd.map((collab) =>
    addCollaborator(token, researchId, collab.id)
  );
  const addResponses = await Promise.all(addPromises);

  // Processa remoção dos colaboradores
  const removePromises = collaboratorsToRemove.map((collab) =>
    removeCollaborator(token, researchId, collab.id)
  );
  const removeResponses = await Promise.all(removePromises);

  return { addResponses, removeResponses };
}

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Obtém o token do cookie
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const {
      id,
      title,
      description,
      release_date,
      end_date,
      lat,
      long,
      location_title,
      selectedCollaborators, // Array de colaboradores já selecionados
      collaboratorsToAdd, // Array de colaboradores a serem adicionados
      collaboratorsToRemove, // Array de colaboradores a serem removidos
    } = req.body;

    // Validação básica dos campos obrigatórios
    if (
      !id ||
      !title ||
      !description ||
      !release_date ||
      !lat ||
      !long ||
      !location_title
    ) {
      return res
        .status(400)
        .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    // Dados para atualização da pesquisa
    const researchData = {
      title,
      description,
      release_date,
      end_date,
      lat,
      long,
      location_title,
    };

    // Atualiza a pesquisa
    const updateResponse = await updateResearch(token, id, researchData);
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return res.status(updateResponse.status).json(errorData);
    }
    const updatedResearch = await updateResponse.json();

    // Inicializa arrays para os resultados finais
    let finalSelectedCollaborators = [...selectedCollaborators];
    let finalCollaboratorsToAdd = collaboratorsToAdd
      ? [...collaboratorsToAdd]
      : [];
    let finalCollaboratorsToRemove = collaboratorsToRemove
      ? [...collaboratorsToRemove]
      : [];

    // Processa colaboradores, se houver arrays de adição ou remoção
    if (
      (collaboratorsToAdd && collaboratorsToAdd.length) ||
      (collaboratorsToRemove && collaboratorsToRemove.length)
    ) {
      const { addResponses, removeResponses } = await processCollaborators(
        token,
        id,
        collaboratorsToAdd,
        collaboratorsToRemove
      );

      // Arrays para armazenar os que tiveram sucesso e os que falharam
      const successfulAdd = [];
      const failedAdd = [];
      for (let i = 0; i < addResponses.length; i++) {
        if (addResponses[i].ok) {
          successfulAdd.push(collaboratorsToAdd[i]);
        } else {
          failedAdd.push(collaboratorsToAdd[i]);
          const errData = await addResponses[i].json();
          console.error("Erro ao adicionar colaborador:", errData);
        }
      }

      const successfulRemove = [];
      const failedRemove = [];
      for (let i = 0; i < removeResponses.length; i++) {
        if (removeResponses[i].ok) {
          successfulRemove.push(collaboratorsToRemove[i]);
        } else {
          failedRemove.push(collaboratorsToRemove[i]);
          const errData = await removeResponses[i].json();
          console.error("Erro ao remover colaborador:", errData);
        }
      }

      // Atualiza o array de colaboradores selecionados:
      // Remove os que foram removidos com sucesso
      if (successfulRemove.length) {
        finalSelectedCollaborators = finalSelectedCollaborators.filter(
          (collab) => !successfulRemove.some((rem) => rem.id === collab.id)
        );
      }

      successfulAdd.forEach((collab) => {
        if (!finalSelectedCollaborators.some((c) => c.id === collab.id)) {
          finalSelectedCollaborators.push(collab);
        }
      });

      finalCollaboratorsToAdd = failedAdd;
      finalCollaboratorsToRemove = failedRemove;
    }

    const finalData = {
      ...updatedResearch,
      selectedCollaborators: finalSelectedCollaborators,
      collaboratorsToAdd: finalCollaboratorsToAdd,
      collaboratorsToRemove: finalCollaboratorsToRemove,
    };

    return res.status(200).json(finalData);
  } catch (err) {
    console.error("Erro no handler:", err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
}
