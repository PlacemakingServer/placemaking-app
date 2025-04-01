// pages/researches/create-research.jsx
import ResearchForm from "@/components/research/ResearchForm";

export default function CreateResearch() {
  const handleCreate = (payload) => {
    // payload contém todos os dados do form + collaborators
    alert(`Pesquisa criada!\n\n${JSON.stringify(payload, null, 2)}`);
    // Aqui você faria um fetch POST para criar no backend, etc.
  };

  return (
    <ResearchForm
      isEdit={false}           // false => criando
      onSubmit={handleCreate}  // callback
    />
  );
}

CreateResearch.layout = "private";
CreateResearch.pageName = "Criar Pesquisa";
