import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import FormField from "@/components/forms/FormField";
import Button from "@/components/ui/Button";
import MapPreview from "@/components/map/MapPreviewNoSSR";
import Switch from "@/components/ui/Switch";
import MultiSelect from "@/components/ui/Multiselect/Multiselect";
import UserCardCompact from "@/components/ui/UserCardCompact";


// Botão de mapa offline carregado de forma dinâmica
const OfflineMapButton = dynamic(() => import("@/components/OfflineMapButton"), {
  ssr: false,
});

/**
 * ResearchForm
 * Componente genérico para criar ou editar Pesquisas.
 *
 * Props:
 *  - initialData (opcional): Valores iniciais da pesquisa (ex.: título, lat, etc.).
 *  - onSubmit (função): Chamado ao enviar o formulário.
 *  - isEdit (boolean): Se está em modo de edição ou criação.
 */
export default function ResearchForm({
  initialData = {},
  onSubmit,
  isEdit = false,
}) {
  // Selecionamos colaboradores originais (apenas se houver no initialData)
  const originalCollaborators = initialData.selectedCollaborators || [];

  // Estado principal do formulário, mesclando com initialData
  const [form, setForm] = useState({
    title: "",
    description: "",
    release_date: "",
    end_date: "",
    lat: "",
    long: "",
    location_title: "",
    weather_celsius: null,
    weather_fahrenheit: null,
    selectedCollaborators: [],
    collaboratorsToAdd: [],
    collaboratorsToRemove: [],
    ...initialData,
  });

  // Para mostrar/ocultar cada seção
  const [showBasicInfo, setShowBasicInfo] = useState(true);
  const [showDates, setShowDates] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState(false);

  // Todos os colaboradores do sistema
  const [allCollaborators, setAllCollaborators] = useState([]);

  // Imagem de fundo
  const [imageUrl, setImageUrl] = useState("");

  /**
   * Atualiza campo de texto no form.
   */
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  /**
   * Atualiza localização ao selecionar no mapa.
   */
  const handleLocationSelect = (data) => {
    setForm((prev) => ({
      ...prev,
      lat: data.lat,
      long: data.lng,
      location_title: data.location || "",
      weather_celsius: data.weather_celsius ?? null,
      weather_fahrenheit: data.weather_fahrenheit ?? null,
    }));
  };

  /**
   * Descartar alterações (apenas quando isEdit = true).
   * Restaura o form ao estado inicial do props.
   */
  const handleDiscard = () => {
    setForm({
      ...initialData,
      selectedCollaborators: originalCollaborators,
      collaboratorsToAdd: [],
      collaboratorsToRemove: [],
    });
  };

  /**
   * Identifica quem é adicionado ou removido comparando a seleção atual
   * com a lista original de colaboradores.
   */
  function refreshCollaboratorsDiff(newSelected) {
    const originalIds = new Set(originalCollaborators.map((c) => c.value));
    const newIds = new Set(newSelected.map((c) => c.value));

    // Adicionados => presentes em newSelected, mas não no original
    const toAdd = newSelected.filter((c) => !originalIds.has(c.value));
    // Removidos => presentes no original, mas não em newSelected
    const toRemove = originalCollaborators.filter((c) => !newIds.has(c.value));

    setForm((prev) => ({
      ...prev,
      selectedCollaborators: newSelected,
      collaboratorsToAdd: toAdd,
      collaboratorsToRemove: toRemove,
    }));
  }

  /**
   * Ao mudar a seleção do MultiSelect:
   *  - Se não estiver em edição, apenas atualiza selectedCollaborators.
   *  - Se estiver em edição, atualiza também collaboratorsToAdd/remov.
   */
  const handleSelectChange = (newValue) => {
    if (!isEdit) {
      setForm((prev) => ({ ...prev, selectedCollaborators: newValue }));
      return;
    }
    refreshCollaboratorsDiff(newValue);
  };

  /**
   * Remove um colaborador da lista de "adicionados" (desfaz a adição).
   */
  const handleRemoveAdd = (user) => {
    const newSelected = form.selectedCollaborators.filter(
      (u) => u.value !== user.value
    );
    refreshCollaboratorsDiff(newSelected);
  };

  /**
   * Desfaz a remoção de um colaborador (recoloca na lista final).
   */
  const handleUndoRemove = (user) => {
    const newSelected = [...form.selectedCollaborators, user];
    refreshCollaboratorsDiff(newSelected);
  };

  /**
   * handleSubmit
   * Cria payload e chama onSubmit, enviando só os dados essenciais do form.
   */
  const handleSubmit = () => {
    // Formata os colaboradores finais
    const selected = form.selectedCollaborators.map((c) => ({
      id: c.value,
      name: c.label,
      role: c.role,
      status: c.status,
      email: c.email,
    }));
    // idem para toAdd / toRemove, se precisar no payload
    const toAdd = form.collaboratorsToAdd.map((c) => ({
      id: c.value,
      name: c.label,
      role: c.role,
      status: c.status,
      email: c.email,
    }));
    const toRemove = form.collaboratorsToRemove.map((c) => ({
      id: c.value,
      name: c.label,
      role: c.role,
      status: c.status,
      email: c.email,
    }));

    // Montamos apenas as props necessárias
    const payload = {
      id: form.id, // se houver
      title: form.title,
      description: form.description,
      release_date: form.release_date,
      end_date: form.end_date,
      lat: form.lat,
      long: form.long,
      location_title: form.location_title,
      weather_celsius: form.weather_celsius,
      weather_fahrenheit: form.weather_fahrenheit,
      selectedCollaborators: selected,
      collaboratorsToAdd: toAdd,
      collaboratorsToRemove: toRemove,
    };

    onSubmit?.(payload);
  };

  /**
   * Sorteia uma imagem de fundo ao montar.
   */
  useEffect(() => {
    const idx = Math.floor(Math.random() * 5);
    setImageUrl(`/img/cards/img-${idx}.jpg`);
  }, []);

  /**
   * Busca lista global de colaboradores (API).
   */
  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        const formatted = data.users?.map((c) => ({
          value: c.id,
          label: c.name,
          role: c.role,
          status: c.status,
          email: c.email,
        }));
        setAllCollaborators(formatted || []);
      } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cabeçalho com imagem de fundo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-t-lg"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black/50 px-6 py-8 sm:px-8 sm:py-10">
          <h1 className="text-2xl font-bold text-white drop-shadow">
            {isEdit ? "Editar Pesquisa" : "Criar Pesquisa"}
          </h1>
          <p className="text-sm text-gray-200 mt-1">
            {isEdit
              ? "Atualize os campos abaixo para editar a pesquisa."
              : "Preencha os campos abaixo para iniciar uma nova pesquisa."}
          </p>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Seção: Informações Básicas */}
        <SectionToggle
          title="Informações Básicas"
          isChecked={showBasicInfo}
          onChange={setShowBasicInfo}
        />
        {showBasicInfo && (
          <div className="space-y-4">
            <FormField
              legend="Título"
              type="text"
              value={form.title}
              onChange={handleChange("title")}
            />
            <FormField
              legend="Descrição"
              type="text"
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Seção: Datas */}
        <SectionToggle
          title="Período da Pesquisa"
          isChecked={showDates}
          onChange={setShowDates}
        />
        {showDates && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              legend="Data de Início"
              type="date"
              value={form.release_date}
              onChange={handleChange("release_date")}
            />
            <FormField
              legend="Data de Fim"
              type="date"
              value={form.end_date}
              onChange={handleChange("end_date")}
            />
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Seção: Localização */}
        <SectionToggle
          title="Localização"
          isChecked={showLocation}
          onChange={setShowLocation}
        />
        {showLocation && (
          <>
            <div className="p-4 rounded-lg space-y-4 bg-gray-50 border">
              <p className="text-sm text-gray-600">
                Defina manualmente ou pelo mapa interativo.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  legend="Latitude"
                  type="text"
                  value={form.lat}
                  onChange={handleChange("lat")}
                  disabled
                />
                <FormField
                  legend="Longitude"
                  type="text"
                  value={form.long}
                  onChange={handleChange("long")}
                  disabled
                />
              </div>

              <FormField
                legend="Localização (Título)"
                type="text"
                value={form.location_title}
                onChange={handleChange("location_title")}
              />

              <div className="flex flex-col items-center border-t pt-4 gap-2">
                <OfflineMapButton onLocationSelect={handleLocationSelect} />
                <p className="text-xs text-gray-500 text-center">
                  Para obter a localização automaticamente, clique em{" "}
                  <strong>“Abrir mapa”</strong>.
                </p>
              </div>
            </div>

            {!!form.lat && !!form.long && (
              <>
                <div className="flex items-center justify-between border-b pb-2 mt-4">
                  <p className="text-sm text-gray-700 font-medium">
                    Exibir Informações da localização
                  </p>
                  <Switch
                    checked={showLocationInfo}
                    onChange={setShowLocationInfo}
                  />
                </div>
                {showLocationInfo && (
                  <div className="mt-4 text-sm text-gray-700 border rounded-md p-4 bg-gray-50 space-y-4">
                    <div>
                      <strong className="block mb-1">
                        Resumo da Localização:
                      </strong>
                      <p>{form.location_title}</p>
                      <p>Lat: {Number(form.lat).toFixed(6)}</p>
                      <p>Long: {Number(form.long).toFixed(6)}</p>
                      {form.weather_celsius && form.weather_fahrenheit && (
                        <p>
                          Clima: {form.weather_celsius}°C /{" "}
                          {Number(form.weather_fahrenheit).toFixed(1)}°F
                        </p>
                      )}
                    </div>
                    <MapPreview
                      lat={Number(form.lat)}
                      lng={Number(form.long)}
                      height="200px"
                      width="100%"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Seção: Colaboradores */}
        <SectionToggle
          title="Colaboradores"
          isChecked={showCollaborators}
          onChange={setShowCollaborators}
        />
        {showCollaborators && (
          <>
            <MultiSelect
              options={allCollaborators}
              value={form.selectedCollaborators}
              onChange={handleSelectChange}
              placeholder="Selecione colaboradores"
            />
            <p className="text-xs text-gray-500">
              Você pode escolher múltiplos colaboradores para participar.
            </p>

            {/* Em modo de edição, exibimos as seções de "adicionados" e "removidos" */}
            {isEdit && (
              <div className="mt-6 space-y-6">
                {/* Adicionados */}
                {form.collaboratorsToAdd?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Colaboradores que serão adicionados
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {form.collaboratorsToAdd.map((usr) => (
                        <UserCardCompact
                          key={usr.value}
                          user={{
                            id: usr.value,
                            name: usr.label,
                            role: usr.role,
                            status: usr.status,
                            email: usr.email,
                          }}
                          borderColor="border-green-500"
                          showRemoveButton={true}
                          onRemove={() => handleRemoveAdd(usr)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Removidos */}
                {form.collaboratorsToRemove?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Colaboradores que serão removidos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {form.collaboratorsToRemove.map((user) => (
                        <UserCardCompact
                          key={user.value}
                          user={{
                            id: user.value,
                            name: user.label,
                            role: user.role,
                            status: user.status,
                            email: user.email,
                          }}
                          borderColor="border-red-500"
                          showRemoveButton={true}
                          onRemove={() => handleUndoRemove(user)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lista final de selecionados */}
            {form.selectedCollaborators?.length > 0 && (
              <div className="mt-6 border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Colaboradores Selecionados (Estado Final)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[14rem] overflow-y-auto">
                  {form.selectedCollaborators.map((user) => (
                    <UserCardCompact
                      key={user.value}
                      user={{
                        id: user.value,
                        name: user.label,
                        role: user.role,
                        status: user.status,
                        email: user.email,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Botões finais (descartar + salvar/criar) */}
        <div className="flex justify-center pt-4 gap-6">
          {isEdit && (
            <Button
              variant="transparent_vermelho"
              onClick={handleDiscard}
              className="active:scale-95"
            >
              Descartar Alterações
            </Button>
          )}
          <Button
            type="submit"
            variant="secondary"
            className="text-lg py-3 active:scale-95"
            onClick={handleSubmit}
          >
            {isEdit ? "Salvar Alterações" : "Criar Pesquisa"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * SectionToggle
 * Pequeno subcomponente para mostrar um título e um switch.
 */
function SectionToggle({ title, isChecked, onChange }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <Switch checked={isChecked} onChange={onChange} />
    </div>
  );
}
