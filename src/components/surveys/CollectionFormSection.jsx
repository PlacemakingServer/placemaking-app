import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, LogIn } from "lucide-react";

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
  survey_type = "Fomulário",
  research_id,
  handleCancelCreateSurvey,
}) {
  const [enabled, setEnabled] = useState(false);
  const { survey: initialData } = useFormSurveys(
    research_id,
    true,
    survey_type
  );
  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    lat: "",
    long: "",
    location_title: "",
    research_id: research_id,
    survey_type: survey_type,
    ...initialData,
  });
  const [isEdit, setIsEdit] = useState(false);
  const initialDataRef = useRef(JSON.stringify(initialData));
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showSurveyInformation, setShowSurveyInformation] = useState(false);
  const [microRegions, setMicroRegions] = useState([]);
  const [timeRanges, setTimeRanges] = useState([]);

  const { addFormSurvey, deleteFormSurvey, updateFormSurvey } = useFormSurveys(
    research_id,
    true,
    "Formulário"
  );



  useEffect(() => {
    const hasInitialData = form.id != '' ?? false;
    const serializedInitial = JSON.stringify(initialData);
    if (initialDataRef.current !== serializedInitial) {
      initialDataRef.current = serializedInitial;
      setForm((prev) => ({ ...prev, ...initialData }));
    }
    setIsEdit(hasInitialData);
    setEnabled(hasInitialData);
  }, [initialData]);

  const handleCreate = async () => {
    const created = await addFormSurvey(formatedForm);
    if (created?.id) {
      setForm((prev) => ({ ...prev, ...created }));
      setIsEdit(true);
    }
  };

  const handleUpdate = async () => {
    if (form.id) {
      await updateFormSurvey(form.id, {
        ...form,
        micro_regions: microRegions,
        time_ranges: timeRanges,
        structure: formStructure,
      });
    }
  };

  const handleDelete = async () => {
    if (form.id) {
      await deleteFormSurvey(form.id);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setEnabled(false);
    setForm((prev) => ({ ...prev, ...initialData }));
    setShowLocationForm(false);
    setShowSurveyInformation(false);
    setMicroRegions([]);
    setTimeRanges([]);
    handleCancelCreateSurvey();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6 transition-all"
    >
      <div className="w-full flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 text-gray-800">
          <ClipboardList size={20} className="text-green-500" />
          <h2 className="text-xl font-bold">
            {isEdit ? `Entrevista: ${form.title}` : "Nova - Entrevista"}
          </h2>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Switch type="arrow" checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p>
          <strong>ID da Pesquisa:</strong> {research_id || "—"}
        </p>
        <p>
          <strong>ID do Tipo de Coleta:</strong> {survey_type || "—"}
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

            <div className="h-px bg-gray-200 my-4" />

            <LocationForm
              form={form}
              setForm={setForm}
              showLocationForm={showLocationForm}
              setShowLocationForm={setShowLocationForm}
            />

            <div className="h-px bg-gray-200 my-4" />

            {form.id && (
              <>
                <MicroRegionEditor
                  regions={microRegions}
                  setRegions={setMicroRegions}
                  form={form}
                  setForm={setForm}
                />
                <div className="h-px bg-gray-200 my-4" />
              </>
            )}

            {form.id && (
              <>
                <TimeRanges
                  timeRanges={timeRanges}
                  setTimeRanges={setTimeRanges}
                />
                <div className="h-px bg-gray-200 my-4" />
              </>
            )}

            {form.id && (
              <>
                <CollaboratorSelector
                  form={form}
                  setForm={setForm}
                  isEdit={isEdit}
                  availableCollaborators={
                    initialData?.available_collaborators || []
                  }
                />
                <div className="h-px bg-gray-200 my-4" />
              </>
            )}

            <div className="pt-6 flex justify-center gap-4">
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <Button
                  variant="verde"
                  onClick={isEdit ? handleUpdate : handleCreate}
                  className="transition-all"
                >
                  {isEdit ? "Salvar Alterações" : "Criar Coleta"}
                </Button>
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <Button
                  variant="vermelho"
                  className="transition-all"
                  onClick={isEdit ? handleDelete : handleCancel}
                >
                  {isEdit ? "Excluir" : "Cancelar"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {form.id && (
        <div>
          <div className="h-px bg-gray-200 my-4" />
          <FormBuilder
            survey_id={form.id}
            survey_type={form.survey_type}
            onChange={(updated) => setFormStructure(updated)}
          />
        </div>
      )}
    </motion.div>
  );
}
