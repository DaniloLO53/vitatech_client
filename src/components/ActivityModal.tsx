import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';
import { api } from '../services/api';

type Location = {
  id: number;
  name: string;
};

type ActivityCatalog = {
  id: number;
  name: string;
};

type ActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSuccess: () => void;
};

export function ActivityModal({ isOpen, onClose, selectedDate, onSuccess }: ActivityModalProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<number | ''>('');
  
  const [activities, setActivities] = useState<ActivityCatalog[]>([]);
  const [activityId, setActivityId] = useState<number | ''>('');
  
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [time, setTime] = useState('18:00');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/api/activities/locations')
        .then(response => {
          setLocations(response.data);
          if (response.data.length > 0) setLocationId(response.data[0].id);
        })
        .catch(error => console.error("Erro ao carregar locais:", error));

      api.get('/api/activities/catalog/search', {
        params: { page: 0, size: 100 }
      })
        .then(response => {
          const fetchedActivities = response.data.content || response.data;
          setActivities(fetchedActivities);
          if (fetchedActivities.length > 0) setActivityId(fetchedActivities[0].id);
        })
        .catch(error => console.error("Erro ao carregar exercícios:", error));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (!activityId || !locationId || !durationMinutes) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const performedAtDate = new Date(`${selectedDate}T${time}:00`);
      
      const payload = {
        activityId: Number(activityId),
        locationId: Number(locationId),
        durationMinutes: Number(durationMinutes),
        performedAt: performedAtDate.toISOString()
      };

      await api.post('/api/activities', payload); 
      
      setDurationMinutes('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao guardar treino:", error);
      alert("Erro ao guardar treino.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registar Treino</h2>
          <button onClick={onClose} className="btn-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group" style={{ flex: 1 }}>
              <label>Localização</label>
              <select 
                value={locationId} 
                onChange={e => setLocationId(Number(e.target.value))} 
                required
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label>Hora</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label>Exercício</label>
            <select 
              value={activityId} 
              onChange={e => setActivityId(Number(e.target.value))} 
              required
            >
              <option value="" disabled>Selecione um exercício...</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.id}>{activity.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label>Duração (minutos)</label>
            <input 
              type="number" 
              placeholder="Ex: 45" 
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value) || '')}
              required
            />
          </div>

          <button type="submit" className="btn-submit" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'A Guardar...' : 'Guardar Treino'}
          </button>
        </form>
      </div>
    </div>
  );
}