import { useState, useEffect } from 'react';
import { api } from '../services/api';

// Tipagens (iguais às do paciente, mas apenas para leitura)
type FoodItem = {
  quantityGrams: number;
  food: { name: string; caloriesPer100g: number; };
};

type Meal = {
  id: number;
  mealType: string;
  consumedAt: string;
  items: FoodItem[];
};

type Workout = {
  id: number;
  durationMinutes: number;
  performedAt: string;
  activity: { name: string; };
};

type PatientDiaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  patientId: number | null;
  patientName: string;
};

export function PatientDiaryModal({ isOpen, onClose, patientId, patientName }: PatientDiaryModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !patientId) return;

    async function fetchPatientDiary() {
      setIsLoading(true);
      try {
        // ATENÇÃO: Ajuste estes endpoints para baterem certo com o seu Controller do Spring Boot
        const [mealsRes, workoutsRes] = await Promise.all([
          api.get(`/api/meals/patient/${patientId}`, { params: { date: selectedDate } }),
          api.get(`/api/activities/patient/${patientId}`, { params: { date: selectedDate } })
        ]);

        setMeals(mealsRes.data);
        setWorkouts(workoutsRes.data);
      } catch (error) {
        console.error("Erro ao carregar diário do paciente:", error);
        setMeals([]);
        setWorkouts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPatientDiary();
  }, [isOpen, patientId, selectedDate]);

  if (!isOpen) return null;

  const translateMealType = (type: string) => {
    const types: Record<string, string> = { BREAKFAST: 'Pequeno-almoço', LUNCH: 'Almoço', DINNER: 'Jantar', SNACK: 'Lanche' };
    return types[type] || type;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#111827' }}>Diário de {patientName}</h2>
          </div>
          <button onClick={onClose} className="btn-close">&times;</button>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Data do Diário:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>A carregar registos...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* SECÇÃO ALIMENTAÇÃO */}
            <div>
              <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '5px', color: '#064e3b' }}>Alimentação</h3>
              {meals.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Sem refeições registadas nesta data.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {meals.map(meal => (
                    <li key={meal.id} style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                        <span>{translateMealType(meal.mealType)}</span>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>{new Date(meal.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: '#4b5563' }}>
                        {meal.items.map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.food.name}</span>
                            <span>{item.quantityGrams}g</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* SECÇÃO TREINOS */}
            <div>
              <h3 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '5px', color: '#1e3a8a' }}>Atividade Física</h3>
              {workouts.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Sem treinos registados nesta data.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {workouts.map(workout => (
                    <li key={workout.id} style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{workout.activity?.name}</span>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {new Date(workout.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{workout.durationMinutes} min</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}