import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';
import { api } from '../services/api';
import axios from 'axios';

type Food = {
  id: number;
  name: string;
};

type SelectedFood = {
  foodId: number;
  name: string;
  quantityGrams: number;
};

type MealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSuccess: () => void;
};

export function MealModal({ isOpen, onClose, selectedDate, onSuccess }: MealModalProps) {
  const [mealType, setMealType] = useState('LUNCH');
  const [time, setTime] = useState('12:00');
  
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<number | ''>('');
  
  const [selectedItems, setSelectedItems] = useState<SelectedFood[]>([]);
  const [quantity, setQuantity] = useState<number | ''>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCreatingFood, setIsCreatingFood] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    caloriesPer100g: '',
    proteinPer100g: '',
    carbsPer100g: '',
    fatPer100g: ''
  });

  // 1. O useEffect agora tem a sua própria função isolada
  useEffect(() => {
    let isMounted = true;

    async function loadInitialFoods() {
      try {
        const response = await api.get('/api/foods/search', {
          params: { page: 0, size: 100 }
        });
        const fetchedFoods = response.data.content || response.data;
        
        if (isMounted) {
          setFoods(fetchedFoods);
          if (fetchedFoods.length > 0) {
            setSelectedFoodId(fetchedFoods[0].id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar alimentos:", error);
      }
    }

    if (isOpen) {
      loadInitialFoods();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleClose() {
    setSelectedItems([]);
    setQuantity('');
    setMealType('LUNCH');
    setIsCreatingFood(false);
    onClose();
  }

 async function handleCreateFood() {
    // Validação básica para garantir que não vão valores vazios
    if (!newFood.name || !newFood.caloriesPer100g || !newFood.proteinPer100g || !newFood.carbsPer100g || !newFood.fatPer100g) {
      alert("Por favor, preencha todos os campos nutricionais.");
      return;
    }

    try {
      const payload = {
        name: newFood.name,
        caloriesPer100g: Number(newFood.caloriesPer100g),
        proteinPer100g: Number(newFood.proteinPer100g),
        carbsPer100g: Number(newFood.carbsPer100g),
        fatPer100g: Number(newFood.fatPer100g)
      };

      const createResponse = await api.post('/api/foods', payload);
      
      // Busca a lista atualizada
      const listResponse = await api.get('/api/foods/search', {
        params: { page: 0, size: 100 }
      });
      const updatedFoods = listResponse.data.content || listResponse.data;
      setFoods(updatedFoods);
      
      const createdId = createResponse.data?.id;
      if (createdId) {
        setSelectedFoodId(createdId);
      } else {
        // Fallback caso a API não devolva o ID no POST
        const found = updatedFoods.find((f: Food) => f.name === newFood.name);
        if (found) setSelectedFoodId(found.id);
      }

      // Limpa e fecha
      setNewFood({ name: '', caloriesPer100g: '', proteinPer100g: '', carbsPer100g: '', fatPer100g: '' });
      setIsCreatingFood(false);

    } catch (error) {
      // Aqui vamos capturar o motivo exato da falha
      if (axios.isAxiosError(error) && error.response) {
        console.error("Erro do servidor:", error.response.data);
        
        // Se o erro for um texto (como no login)
        if (typeof error.response.data === 'string') {
          alert(`Erro do servidor: ${error.response.data}`);
        } else {
          // Se o Spring Boot devolver um objeto JSON com erros de validação
          alert(`Erro de validação! Verifique a consola do navegador para mais detalhes.`);
        }
      } else {
        alert("Falha na ligação ao servidor.");
      }
    }
  }

  function handleAddItem() {
    if (!selectedFoodId || !quantity || quantity <= 0) {
      alert("Selecione um alimento e insira uma quantidade válida.");
      return;
    }
    const food = foods.find(f => f.id === Number(selectedFoodId));
    if (!food) return;

    setSelectedItems(prev => [
      ...prev, 
      { foodId: food.id, name: food.name, quantityGrams: Number(quantity) }
    ]);
    setQuantity('');
  }

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Adicione pelo menos um alimento à refeição.");
      return;
    }

    setIsSubmitting(true);
    try {
      const consumedAtDate = new Date(`${selectedDate}T${time}:00`);
      
      const payload = {
        mealType,
        consumedAt: consumedAtDate.toISOString(),
        items: selectedItems.map(item => ({
          foodId: item.foodId,
          quantityGrams: item.quantityGrams
        }))
      };

      await api.post('/api/meals', payload);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Erro ao guardar refeição:", error);
      alert("Erro ao guardar refeição.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registar Refeição</h2>
          <button type="button" onClick={handleClose} className="btn-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group" style={{ flex: 1 }}>
              <label>Tipo de Refeição</label>
              <select value={mealType} onChange={e => setMealType(e.target.value)} required>
                <option value="BREAKFAST">Pequeno-almoço</option>
                <option value="LUNCH">Almoço</option>
                <option value="SNACK">Lanche</option>
                <option value="DINNER">Jantar</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Hora</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '20px' }}>
            {isCreatingFood ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0, color: '#10b981' }}>Criar Novo Alimento</h4>
                
                <div className="input-group">
                  <input type="text" placeholder="Nome (ex: Panqueca de Aveia)" value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input type="number" placeholder="Kcal / 100g" value={newFood.caloriesPer100g} onChange={e => setNewFood({...newFood, caloriesPer100g: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input type="number" placeholder="Prot(g)" value={newFood.proteinPer100g} onChange={e => setNewFood({...newFood, proteinPer100g: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input type="number" placeholder="Carb(g)" value={newFood.carbsPer100g} onChange={e => setNewFood({...newFood, carbsPer100g: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input type="number" placeholder="Gord(g)" value={newFood.fatPer100g} onChange={e => setNewFood({...newFood, fatPer100g: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={handleCreateFood} className="btn-add" style={{ flex: 1 }}>Guardar Alimento</button>
                  <button type="button" onClick={() => setIsCreatingFood(false)} style={{ flex: 1, backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ margin: 0 }}>Adicionar Alimento</label>
                  <button type="button" onClick={() => setIsCreatingFood(true)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                    + Novo Alimento
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    value={selectedFoodId} 
                    onChange={e => setSelectedFoodId(Number(e.target.value))} 
                    style={{ flex: 2 }}
                  >
                    {foods.length === 0 && <option value="" disabled>Nenhum alimento criado...</option>}
                    {foods.map(food => (
                      <option key={food.id} value={food.id}>{food.name}</option>
                    ))}
                  </select>
                  
                  <input 
                    type="number" 
                    placeholder="Gramas" 
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value) || '')}
                    style={{ flex: 1 }}
                  />
                  
                  <button type="button" onClick={handleAddItem} className="btn-add" style={{ padding: '0 15px', whiteSpace: 'nowrap' }}>
                    + Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="selected-items">
              <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>Alimentos nesta refeição:</h4>
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#4b5563' }}>
                {selectedItems.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '5px' }}>
                    {item.name} - {item.quantityGrams}g
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" className="btn-submit" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'A Guardar...' : 'Guardar Refeição'}
          </button>
        </form>
      </div>
    </div>
  );
}