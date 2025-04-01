import { useState } from 'react';
import dynamic from 'next/dynamic';
import FormField from '@/components/forms/FormField';

const OfflineMapButton = dynamic(() => import('@/components/OfflineMapButton'), { ssr: false });

export default function CreateResearch() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    release_date: '',
    end_date: '',
    lat: '',
    long: '',
    location_title: '',
  });

  const [locationData, setLocationData] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLocationSelect = (data) => {
    setForm((prev) => ({
      ...prev,
      lat: data.lat,
      long: data.lng,
      location_title: data.location,
    }));
    setLocationData(data);
  };

  const handleSubmit = () => {
    alert(`Pesquisa criada!\n\n${JSON.stringify(form, null, 2)}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Criar Pesquisa</h1>
      <p className="text-sm text-gray-600">Preencha os campos abaixo para iniciar uma nova pesquisa.</p>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <FormField legend="Título" type="text" value={form.title} onChange={handleChange('title')} />
        <FormField legend="Descrição" type="text" value={form.description} onChange={handleChange('description')} />
        <FormField legend="Data de Início" type="date" value={form.release_date} onChange={handleChange('release_date')} />
        <FormField legend="Data de Fim" type="date" value={form.end_date} onChange={handleChange('end_date')} />
        <div className="bg-gray-100 p-4 rounded-lg space-y-4">
          <p className="text-xs text-gray-500">Informações da localização da pesquisa</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField legend="Latitude" type="text" value={form.lat} bgColor='bg-gray' onChange={handleChange('lat')} disabled />
            <FormField legend="Longitude" type="text" value={form.long} bgColor='bg-gray' onChange={handleChange('long')} disabled />
          </div>
          <FormField legend="Localização" type="text" value={form.location_title} bgColor='bg-gray' onChange={handleChange('location_title')} disabled />
        <div className="flex flex-row justify-center intems-center border-t pt-4">
          <OfflineMapButton onLocationSelect={handleLocationSelect} />
        </div>
        </div>


        {locationData && (
          <div className="mt-4 text-sm text-gray-700 border rounded-md p-4 bg-gray-50">
            <strong className="block mb-1">Resumo da Localização:</strong>
            <p>{locationData.location}</p>
            <p>Lat: {locationData.lat.toFixed(6)}</p>
            <p>Long: {locationData.lng.toFixed(6)}</p>
            <p>Clima: {locationData.weather_celsius}°C / {locationData.weather_fahrenheit?.toFixed(1)}°F</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Criar Pesquisa
          </button>
        </div>
      </div>
    </div>
  );
}

CreateResearch.layout = "private";
CreateResearch.pageName = "Criar Pesquisa";