import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";

import Switch from "@/components/ui/Switch";
import Button from "@/components/ui/Button";
import FormBuilder from "@/components/forms/FormBuilder";
import MicroRegionEditor from "@/components/surveys/MicroRegionEditor";
import LocationForm from "@/components/surveys/LocationForm";
import BasicInformation from "@/components/surveys/BasicInformation";
import CollaboratorSelector from "@/components/surveys/CollaboratorSelector";
import TimeRanges from "@/components/surveys/TimeRanges";

import { useFormSurveys } from "@/hooks";
import { formatDataByModel } from "@/lib/types/models";

export default function CollectionFormSection({
  survey_type = "Formulário",
  research_id,
  handleCancelCreateSurvey,
  users,
}) {
  const [enabled, setEnabled] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    lat: "",
    long: "",
    location_title: "",
    research_id,
    survey_type,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [microRegions, setMicroRegions] = useState([]);
  const [timeRanges, setTimeRanges] = useState([]);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showSurveyInformation, setShowSurveyInformation] = useState(false);

  const { formSurvey, addFormSurvey, updateFormSurvey, deleteFormSurvey } =
    useFormSurveys(research_id, true, "Formulário");
  const router = useRouter();

  useEffect(() => {
    if (formSurvey) {
      setForm((prev) => ({ ...prev, ...formSurvey }));
      setIsEdit(true);
    }
  }, [formSurvey]);

  const handleCreate = async () => {
    const formattedForm = formatDataByModel(form, "form_surveys");
    await addFormSurvey(formattedForm);
    router.reload();
  };

  const handleUpdate = async () => {
    if (form.id) {
      const formattedForm = formatDataByModel(form, "form_surveys");
      await updateFormSurvey(form.id, { ...formattedForm });
      router.reload();
    }
  };

  const handleDelete = async () => {
    if (form.id) {
      const formattedForm = formatDataByModel(form, "form_surveys");
      await deleteFormSurvey(formattedForm);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setEnabled(false);
    handleCancelCreateSurvey();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-gray-800">
          <ClipboardList size={20} className="text-green-500" />
          <h2 className="text-xl font-bold">
            {isEdit ? `Entrevista: ${form.title}` : "Nova - Entrevista"}
          </h2>
        </div>
        <Switch checked={enabled} onChange={setEnabled} />
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p>
          <strong>ID da Pesquisa:</strong> {research_id || "—"}
        </p>
        <p>
          <strong>Tipo de Coleta:</strong> {survey_type || "—"}
        </p>
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            key="form-content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <BasicInformation
              form={form}
              setForm={setForm}
              showSurveyInformation={showSurveyInformation}
              setShowSurveyInformation={setShowSurveyInformation}
            />

            <LocationForm
              form={form}
              setForm={setForm}
              showLocationForm={showLocationForm}
              setShowLocationForm={setShowLocationForm}
            />

            <div className="flex justify-center gap-4 pt-6">
              <Button
                variant="verde"
                onClick={isEdit ? handleUpdate : handleCreate}
                className="transition-all"
              >
                {isEdit ? "Salvar Alterações" : "Criar Coleta"}
              </Button>

              <Button
                variant="vermelho"
                onClick={isEdit ? handleDelete : handleCancel}
                className="transition-all"
              >
                {isEdit ? "Excluir" : "Cancelar"}
              </Button>
            </div>

            {isEdit && (
              <div className="flex justify-between items-center my-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Informações Adicionais
                </h3>
                <Switch
                  checked={showAdditionalInfo}
                  onChange={setShowAdditionalInfo}
                />
              </div>
            )}

            <AnimatePresence>
              {showAdditionalInfo && form.id && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <MicroRegionEditor
                    location={{
                      location_title: form.location_title,
                      lat: form.lat,
                      long: form.long,
                    }}
                    survey_id={form.id}
                    survey_type={form.survey_type}
                  />
                  <TimeRanges
                    timeRanges={timeRanges}
                    setTimeRanges={setTimeRanges}
                  />

                  <CollaboratorSelector
                    availableCollaborators={users || []}
                    survey_id={form.id}
                  />

                  <FormBuilder
                    survey_id={form.id}
                    survey_type={form.survey_type}
                    onChange={() => {}}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
