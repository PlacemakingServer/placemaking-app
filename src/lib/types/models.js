const modelSamples = {
    users: {
      id: "",
      name: "",
      email: "",
      password: "",
      role: "",
      status: "",
      created_at: undefined,
      updated_at: undefined,
    },
    fields: {
      id: undefined,
      activity_id: "",
      title: "",
      input_type: "",
      description: undefined,
      created_at: undefined,
      updated_at: undefined,
    },
    researches: {
      id: undefined,
      title: "",
      description: undefined,
      release_date: undefined,
      lat: undefined,
      long: undefined,
      location_title: undefined,
      created_by: undefined,
      created_at: undefined,
      updated_at: undefined,
      end_date: undefined,
      status: undefined,
    },
    survey_time_ranges: {
      id: "",
      start_time: "",
      end_time: "",
      survey_id: "",
      survey_type: "",
    },
    survey_regions: {
      id: "",
      name: "",
      lat: 0,
      long: 0,
      location_title: "",
      survey_type: "",
      survey_id: "",
    },
    survey_group: {
      id: "",
      survey_type: "",
      survey_id: "",
    },
    survey_contributors: {
      id: "",
      survey_id: "",
      survey_type: "",
      user_id: "",
      instruction: undefined,
      created_at: undefined,
      updated_at: undefined,
    },
    survey_answers: {
      id: "",
      value: "",
      survey_type: "",
      survey_id: "",
      survey_group_id: undefined,
      contributor_id: "",
      registered_at: "",
      survey_time_range_id: undefined,
      survey_region_id: undefined,
    },
    static_surveys: {
      id: "",
      title: "",
      description: undefined,
      lat: 0,
      long: 0,
      location_title: "",
      research_id: undefined,
    },
    form_surveys: {
      id: "",
      title: "",
      description: undefined,
      lat: 0,
      long: 0,
      location_title: "",
      research_id: undefined,
    },
    dynamic_surveys: {
      id: "",
      title: "",
      description: undefined,
      lat: 0,
      long: 0,
      location_title: "",
      research_id: undefined,
    },
    research_contributors: {
      id: "",
      research_id: "",
      user_id: "",
      instruction: "",
    },
    input_types: {
      id: "",
      name: "",
      stored_as: "",
    },
    field_options: {
      id: "",
      field_id: "",
      option_text: "",
      option_value: undefined,
      created_at: "",
      updated_at: "",
    },
    unsynced_items: {
      id: "",              
      store: "",           
      payload: {},         
      created_at: "",     
    },
};

export default modelSamples;



/**
 * Formata um objeto de dados para conter apenas os campos válidos
 * de acordo com o modelo da store no modelSamples.
 *
 * @param {Object} data - O objeto de dados que será formatado.
 * @param {string} storeType - O nome da store (ex: 'researches', 'users', etc).
 * @returns {Object} Objeto formatado contendo apenas os campos esperados.
 */
export function formatDataByModel(data, storeType) {
  const sample = modelSamples[storeType];

  if (!sample) {
    console.warn(`Store type '${storeType}' não encontrado no modelSamples.`);
    return {};
  }

  const formatted = {};

  for (const key of Object.keys(sample)) {
    if (key in data) {
      formatted[key] = data[key];
    } else {
      formatted[key] = undefined;
    }
  }

  return formatted;
}
  